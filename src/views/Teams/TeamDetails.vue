<template>
  <div class="team-details">
    <NavBar></NavBar>

    <div id="head" :class="team.codigo">
      <h1 class="text-uppercase text-h3 text-md-h2 text-lg-h2 text-xl-h2" id="nombre_team"> {{ team.nombre }}</h1>
    </div>

    <v-container class="pa-4">
      <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-4">
        <img :src="team.url_logo" id="image_logo" alt="Team logo">
      </v-col>
      <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-4">
        <img :src="team.url_coche" id="image_car" alt="Team car">
      </v-col>
    </v-container>

    <v-card class="info_container_main" elevation="6">
      <h2 :class="team.codigo" class="text-h5 text-md-h4 text-lg-h4 text-xl-h4">INFORMACION</h2><br>
      <div class="pa-0">
        <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-5">
          <p>Nombre completo</p><hr>
          <p class="text-h6 font-weight-bold"> {{ team.nombre_completo }} </p>
        </v-col>
        <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-5">
          <p>Jefe de equipo</p><hr>
          <p class="text-h6 font-weight-bold"> {{ team.jefe_equipo }} </p>
        </v-col>
        <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-5">
          <p>Mundiales</p><hr>
          <p class="text-h6 font-weight-bold"> {{ team.mundiales_constructores }}</p>
        </v-col >
        <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-5">
          <p>Puntos</p><hr>
          <p class="text-h6 font-weight-bold"> {{ team.puntos }} </p>
        </v-col>
      </div>
    </v-card>

    <v-card class="info_container_main" elevation="6">
      <h2 :class="team.codigo" class="text-h5 text-md-h4 text-lg-h4 text-xl-h4">PILOTOS</h2><br>
      <v-col class="col-6 pa-6">
        <img :src="team.url_piloto_1" class="image_drivers img_fluid" alt="Driver image 1">
        <h1 class="text-sm-h6 subtitle-1"> {{ team.piloto_1 }} </h1>
      </v-col>
      <v-col class="col-6 pa-6">
        <img :src="team.url_piloto_2" class="image_drivers img_fluid" alt="Driver image 2">
        <h1 class="text-sm-h6 subtitle-1"> {{ team.piloto_2 }} </h1>
      </v-col>
    </v-card>

    <v-card class="info_container_main" elevation="6">
      <h2 :class="team.codigo" class="text-h5 text-md-h4 text-lg-h4 text-xl-h4">DESCRIPCION</h2><br>
      <v-card-text class="text--primary text-left"> {{ team.descripcion }}</v-card-text>
    </v-card>
    </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";

export default {
  components: {NavBar},
  data(){
    return {
      team: {}
    }
  },
  name: "TeamDetails",
  created(){
    window.scrollTo(0,0)
    this.team = fb_functions.getTeam(this.$route.params.id)
  },
}
</script>

<style scoped>
.team-details{
  background-color: white;
  margin-top: 48px;
  text-align: center;
}

#head{
  width: 100%;
}

#nombre_team{
  padding: 10%;
  width: 100%;
  color: white;
  display: inline-block;
}

.img_fluid {
  max-width: 100%;
  height: auto;
}

.info_container_main{
  margin: 5%;
  width: 90%;
  display: inline-block;
}

#image_car{
  margin-top: 10% !important;
  width: 100%;
  float: left;
}

#image_logo{
  width: 100%;
  float: left;
}

.image_drivers{
  width: 100%;
  object-fit: cover;
  object-position: 50% 5%;
}

h2{
  color: white;
  padding: 1%;
}

p{
  margin-top: 10px;
  color: black;
}

[class*="col"] {
  float: left;
}

h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2, .subtitle-1, .subtitle-2, .title-1, .title-2{
  font-family: "F1 Regular" !important;
}

.mercedes{
  background-color: #00D2BE;
}
.red_bull{
  background-color: #0600EF;
}
.mclaren{
  background-color: #FF9800;
}
.ferrari{
  background-color: #FC0000;
}
.alpine{
  background-color: #0090FF;
}
.alphatauri{
  background-color: #2B4562;
}
.aston_martin{
  background-color: #006F62;
}
.alfa{
  background-color: #900000;
}
.williams{
  background-color: #005AFF;
}
.haas{
  background-color: #CCCCCC;
  color: #212121 !important;
}
.default{
  background-color: #111111;
}
</style>