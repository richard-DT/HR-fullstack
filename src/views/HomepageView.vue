<template>
  <div class="home-container">

    <!-- Title -->
    <div class="title">
      <h1>Welcome to your HR Portal</h1>
      <p>Select your company to continue</p>
    </div>

    <!-- Logos -->
    <div class="logo-wrapper">
      
      <div class="logo-card" @click="goToLogin('bozzvics')">
        <img :src="bozzvicsLogo" alt="Bozzvics" />
      </div>

      <div class="logo-card" @click="goToLogin('woodlands')">
        <img :src="woodlandsLogo" alt="Woodlands" />
      </div>

    </div>

  </div>
</template>

<script setup>

import { useRouter } from 'vue-router'
import bozzvicsLogo from '@/assets/bozzvicsLogo.png'
import woodlandsLogo from '@/assets/woodlandsLogo.png'

const router = useRouter()

const goToLogin = (company) => {
  router.push({ path: '/login', query: { company }})

}

</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f4f6f9;
  padding: 20px;
  text-align: center;
}

/* Title */
.title h1 {
  font-size: 2.5rem;
  margin-bottom: 5px;
  font-weight: 700;
}

.title p {
  color: #6c757d;
  margin-bottom: 40px;
}

/* Logo layout */
.logo-wrapper {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Circular logo */
.logo-card {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  transition: all 0.25s ease;
}

.logo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Eto ang secret para mapuno yung bilog */
  display: block;
}

/* Hover effect */
.logo-card:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

/* 📱 Mobile */
@media (max-width: 600px) {
  .logo-card {
    width: 130px;
    height: 130px;
  }

  .title h1 {
    font-size: 2rem;
  }
}
</style>