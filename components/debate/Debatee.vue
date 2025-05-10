<template>
    <div class="flex flex-col items-center p-4">
      <div class="flex gap-4 mb-6">
        <video v-if="isDebatee" ref="localVideo" autoplay playsinline muted class="w-80 h-60 rounded-lg bg-black object-cover"></video>
        <div class="relative">
        <video v-if="isDebatee" ref="remoteVideo" autoplay playsinline class="w-80 h-60 rounded-lg bg-black object-cover"></video>

         <!-- Overlay displayed on top of the video -->
  <div v-if="showBibleVerse" class="absolute top-0 left-0 text-white text-lg p-2 bg-black bg-opacity-50">
    {{ bibleVerse }}
  </div>
</div>
        </div>
        <div v-if="isDebatee">
          <button
            v-if="!joined"
            @click="joinDebate"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            Join Debate
          </button>
          <!-- <p v-else class="text-gray-600">Waiting for the debate to start...</p> -->
        </div>
      
    </div>
</template>



<script setup>
import { ref } from 'vue';
import { io } from 'socket.io-client';

const isDebatee = ref(false);

const localVideo = ref(null);
const remoteVideo = ref(null);
const joined = ref(false);

const showBibleVerse = ref(true);  // Flag to toggle the overlay visibility
const bibleVerse = ref('For God so loved the world...');  // Example Bible verse text

const socket = io('http://localhost:3000/api/socket.io', {
  transports: ['websocket', 'polling'],
});

let peerConnection;
let localStream = null;
let queuedCandidates = [];

const getUserMedia = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.value.srcObject = stream;
  localStream = stream;
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

const joinDebate = async () => {
  joined.value = true;
  await getUserMedia();

  peerConnection = new RTCPeerConnection();
  peerConnection.ontrack = (e) => {
    remoteVideo.value.srcObject = e.streams[0];
  };
  peerConnection.onicecandidate = (e) => {
    if (e.candidate) socket.emit('ice-candidate', e.candidate);
  };
  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE state:', peerConnection.iceConnectionState);
  };
  peerConnection.onconnectionstatechange = () => {
    console.log('Connection state:', peerConnection.connectionState);
  };

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  socket.off('offer').on('offer', async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);

    queuedCandidates.forEach(tryAddIceCandidate);
    queuedCandidates = [];
  });

  socket.off('ice-candidate').on('ice-candidate', tryAddIceCandidate);
};


onMounted(async () => {
  const role = new URLSearchParams(window.location.search).get('role');
  isDebatee.value = role === 'viewer';
  await getVideoDevices();
  selectedCamera.value = videoDevices.value[0]?.deviceId;
});
</script>