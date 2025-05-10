<template>
  <div v-if="isDebater" class="flex flex-col items-center p-4">
    <div class="flex gap-4 mb-6">
      <video ref="localVideo"  class="w-80 h-60 rounded-lg bg-black object-cover" autoplay muted></video>
      <video ref="remoteVideo"  class="w-80 h-60 rounded-lg bg-black object-cover" autoplay></video>
      
    </div>
    <div v-if="isDebater">
    <!-- <button @click="startCamera" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">Start Camera</button> -->
      <button @click="startDebate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">Start Debate</button>
    </div>
    <!-- <div>
      <label for="cameraSelect">Select Camera:</label>
      <select v-model="selectedCamera" id="cameraSelect" @change="changeCamera">
        <option v-for="(device, index) in videoDevices" :key="index" :value="device.deviceId">
          {{ device.label }}
        </option>
      </select>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';

const isDebater = ref(false);
const statusMessage = ref('Waiting for the debate to start...');
const selectedCamera = ref('');
const localVideo = ref(null);
const remoteVideo = ref(null);
const videoDevices = ref([]);

const socket = io('http://localhost:3000/api/socket.io', {
  transports: ['websocket', 'polling'],
});

let peerConnection;
let localStream = null;
let queuedCandidates = [];
let debateStarted = false;

onMounted(async () => {
  const role = new URLSearchParams(window.location.search).get('role');
  if (role !== 'debater' && role !== 'viewer') {
    alert('Invalid role. Use "?role=debater" or "?role=viewer" in URL.');
    window.location.href = '/';
  }

  isDebater.value = role === 'debater';
  await getVideoDevices();
  selectedCamera.value = videoDevices.value[0]?.deviceId;
});

const getVideoDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  videoDevices.value = devices.filter(d => d.kind === 'videoinput');
};

const changeCamera = async () => {
  if (localStream) localStream.getTracks().forEach(track => track.stop());
  await startCamera();
};

const getUserMedia = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: selectedCamera.value },
    audio: true,
  });
  localVideo.value.srcObject = stream;
  localStream = stream;
};

const startCamera = async () => {
  if (selectedCamera.value) await getUserMedia();
};

const startDebate = async () => {
  if (debateStarted) return;
  debateStarted = true;

  await getUserMedia();

  if (!peerConnection) {
    peerConnection = new RTCPeerConnection();
    peerConnection.ontrack = handleTrackEvent;
    peerConnection.onicecandidate = handleICECandidate;
    peerConnection.oniceconnectionstatechange = logState;
    peerConnection.onconnectionstatechange = logState;
  }

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit('offer', offer);
};

const handleICECandidate = (event) => {
  if (event.candidate) socket.emit('ice-candidate', event.candidate);
};

const handleTrackEvent = (event) => {
  remoteVideo.value.srcObject = event.streams[0];
};

const tryAddIceCandidate = (candidate) => {
  if (peerConnection.remoteDescription) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      .then(() => console.log('Added ICE candidate'))
      .catch(err => console.error('Error adding ICE:', err));
  } else {
    queuedCandidates.push(candidate);
  }
};

const logState = () => {
  console.log('ICE state:', peerConnection.iceConnectionState);
  console.log('Connection state:', peerConnection.connectionState);
};

socket.off('answer').on('answer', async (answer) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  queuedCandidates.forEach(tryAddIceCandidate);
  queuedCandidates = [];
});

socket.off('ice-candidate').on('ice-candidate', tryAddIceCandidate);
</script>
