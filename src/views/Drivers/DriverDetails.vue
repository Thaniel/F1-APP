<template>
  <div class="driver-details">
    <NavBar></NavBar>
    <div id="head" :class="driver.codigo">
      <h1 class="text-h4 text-uppercase font-weight-bold" id="name_driver"> {{ driver.nombre }} </h1>
    </div>

    <v-container class="pa-4">
      <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-8">
        <img :src="driver.url_logo" alt="Team image">
      </v-col>
      <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-8">
        <img :src="driver.url_piloto" alt="Driver image">
      </v-col>
    </v-container>

    <v-card class="info_container_main" elevation="6">
      <h2 :class="driver.codigo" class="text-h5 text-md-h4 text-lg-h4 text-xl-h4 white--text">INFORMACION</h2><br>
      <div class="pa-0">
        <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-5">
          <p>País</p><hr>
          <p class="text-h6 font-weight-bold"> {{ driver.pais }} </p>
        </v-col>
        <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-5">
          <p>Mundiales</p><hr>
          <p class="text-h6 font-weight-bold"> {{ driver.mundiales }}</p>
        </v-col >
        <v-col class="col-12 col-md-6 col-lg-6 col-xl-6 pa-5">
          <p>Puntos</p><hr>
          <p class="text-h6 font-weight-bold"> {{ driver.puntos }}</p>
        </v-col >
      </div>
    </v-card>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";

export default {
  components: {NavBar},
  name: "DriverDetails",
  data(){
    return {
      driver: {},
    }
  },
  created() {
    window.scrollTo(0,0)
    this.driver = fb_functions.getDriver(this.$route.params.id)
  }
}
</script>

<style scoped>

.driver-details{
  background-color: white;
  height: auto;
  text-align: center;
  margin-top: 48px;
}

#head{
  width: 100%;
  margin-bottom: 5%;
}

#name_driver{
  padding: 10%;
  width: 100%;
  color: white;
  display: inline-block;
}

img{
  width: 100%;
  float: left;
}

[class*="col"] {
  float: left;
}
.info_container_main{
  margin: 5%;
  width: 90%;
  display: inline-block;
}

h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2{
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