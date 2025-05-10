<template>
    <div>
      <video ref="localVideo" autoplay muted></video>
      <video ref="remoteVideo" autoplay></video>
      <button v-if="isViewer" @click="joinDebate">Join Debate</button>
      <p v-else>{{ statusMessage }}</p> <!-- Dynamically change the status message -->
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { io } from 'socket.io-client';
  
  const isViewer = ref(false);
  const statusMessage = ref('Waiting for the debate to start...');
  let peerConnection;
  let localStream = null;
  let remoteDescriptionSet = false; // Flag to track if remote description is set
  let queuedCandidates = []; // Store ICE candidates until remote description is set
  
  onMounted(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const role = searchParams.get('role');
  
    if (role !== 'debater' && role !== 'viewer') {
      alert('Invalid role. Please add "?role=debater" or "?role=viewer" to the URL.');
      window.location.href = '/';
    }
  
    isViewer.value = role === 'viewer'; // Set the role
  });
  
  const socket = io('http://localhost:3000/api/socket.io', {
    transports: ['websocket', 'polling'],
  });
  
  const localVideo = ref(null);
  const remoteVideo = ref(null);
  
  // Get the user's media (video/audio)
  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideo.value.srcObject = stream;
      localStream = stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };
  
  // Handle "Join Debate" click
  const joinDebate = async () => {
    await getUserMedia();
  
    // Create peer connection and add local stream tracks
    peerConnection = new RTCPeerConnection();
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      remoteVideo.value.srcObject = event.streams[0];
    };
  
    // When ICE candidate is found, queue or send
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate); // Send ICE candidate to debater
      }
    };
  
    // Wait for offer from debater and set remote description
    socket.on('offer', async (offer) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer)); // Set remote description
      console.log('Remote description set successfully');
      
      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer); // Set local description
  
      // Send answer to debater
      socket.emit('answer', answer);
  
      // Now send queued ICE candidates after remote description is set
      queuedCandidates.forEach(candidate => peerConnection.addIceCandidate(candidate));
      queuedCandidates = []; // Clear the queue after processing candidates
    });
  
    // Queue ICE candidates until remote description is set
    socket.on('ice-candidate', (candidate) => {
      if (peerConnection.signalingState === 'have-remote-offer' || peerConnection.signalingState === 'stable') {
        try {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('ICE candidate added to peer connection');
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      } else {
        console.log('ICE candidate queued because remote description is not set');
        queuedCandidates.push(candidate); // Queue ICE candidates until remote description is set
      }
    });
  };
  </script>
  