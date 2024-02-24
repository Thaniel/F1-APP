<template>
  <div class="schedule-details">
    <NavBar></NavBar>
    <div id="head">
      <h1 class="text-h4 text-md-h3 text-lg-h3 text-xl-h3"> {{ circuit.gran_premio }} </h1>
    </div>

    <template>
      <v-img :src="circuit.foto_gp" alt="F1 Circuit"/>
    </template>

    <div id="schedule_container">
      <h1 class="ma-2 text-h5 text-md-h4 text-lg-h4 text-xl-h4 text-center font-weight-bold"> {{ circuit.circuito }}</h1>

      <h2 class="mb-10 ma-6 text-h6 text-md-h5 text-lg-h5 text-xl-h5 text-center"> {{ circuit.fecha }} </h2>
      <h2 class="ma-0 text-subtitle-1 text-md-h6 text-lg-h6 text-xl-h6 text-left black--text"> Clasificacion </h2>
      <h2 class="ml-4 text-subtitle-1 text-md-h6 text-lg-h6 text-xl-h6 text-left font-weight-bold"> {{ circuit.horario_clasi }} </h2>
      <h2 class="mt-6 text-subtitle-1 text-md-h6 text-lg-h6 text-xl-h6 text-left black--text"> Carrera </h2>
      <h2 class="ml-4 text-subtitle-1 text-md-h6 text-lg-h6 text-xl-h6 text-left font-weight-bold"> {{ circuit.horario_carrera }} </h2>

      <v-card class="card_container" elevation="2">
        <v-toolbar flat color="#2c3e50" dark>
          <v-toolbar-title class="toolbar_title">Datos del circuito</v-toolbar-title>
        </v-toolbar>
        <div class="pa-5">
          <v-layout>
            <v-col>
              <p>Longitud del circuito</p><hr>
              <p class="text-h6 font-weight-bold"> {{ circuit.tamanno_c }} Km </p>
            </v-col>
            <v-col>
              <p>Vueltas</p><hr>
              <p class="text-h6 font-weight-bold"> {{ circuit.vueltas_c }} </p>
            </v-col>
          </v-layout>
          <v-layout>
            <v-col>
              <p>Primera aparicion</p><hr>
              <p class="text-h6 font-weight-bold"> {{ circuit.aparicion_c }} </p>
            </v-col>
            <v-col>
              <p>Distancia de carrera</p><hr>
              <p class="text-h6 font-weight-bold"> {{ circuit.carrera_dist_c }} Km</p>
            </v-col>
          </v-layout>
          <v-layout>
            <v-col>
              <p>Record</p><hr>
              <p class="text-h6 font-weight-bold"> {{ circuit.record_c }} </p>
            </v-col>
          </v-layout>
        </div>

      </v-card>
      <v-card class="card_container" elevation="2">
        <v-toolbar flat color="#2c3e50" dark>
          <v-toolbar-title>Descripcion</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="text--primary pa-5 text-justify"> {{ circuit.descripcion }}</v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";

export default {
  components: {NavBar},
  name: "ScheduleDetails",
  data(){
    return {
      circuit: {},
    }
  },
  created() {
    window.scrollTo(0,0)

    this.circuit = fb_functions.getCircuit(this.$route.params.id)
  }
}
</script>

<style scoped>
.schedule-details{
  background-color: white;
  text-align: center;
  margin-top: 48px;
}

#head{
  width: 100%;
  padding: 10% 10%;
  background-color: #D50000;
  display: inline-block;
  text-align: left;
  color: white;
}

#schedule_container{
  width: 80%;
  background-color: #fff;
  display: inline-block;
  text-align: left;
  margin-top: 5%;
}

.card_container{
  margin-top: 10%;
  width: 100%;
  border-radius: 12px;
  margin-bottom: 10%;
}

img{
  width: 100%;
}

p{
  text-align: center;
  margin-bottom: 8px;
  margin-top: 16px;
}

h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2{
  font-family: "F1 Regular" !important;
}
</style>