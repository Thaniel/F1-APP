<template>
  <div class="home">
    <NavBar></NavBar>
    <div class="contenedor ma-0">

      <img src="https://firebasestorage.googleapis.com/v0/b/f1-app-daa49.appspot.com/o/wallpaper.jpg?alt=media&token=0a8dab17-39c3-4c18-b9b7-26b346e47d79" alt="F1 wallpap" width="100%" class="mt-12"/>
      <div class="centrado text-h4 text-md-h1 text-lg-h1 text-xl-h1">F1 APP</div>
    </div>
    <!--<div width="100%">
      <video width="100%" controls >
        <source src="https://firebasestorage.googleapis.com/v0/b/f1-app-daa49.appspot.com/o/video.mp4?alt=media&token=5caa6bf3-989f-44f7-ad85-8c0aa111ac3e" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>-->

    <v-carousel class="carousel ma-0" cycle hide-delimiter-background show-arrows-on-hover style="z-index: 0">
      <v-carousel-item v-for="(slide, i) in info" :key="i">
        <template v-for="(textarea) in slide">
          <v-sheet class="sheet" v-if="textarea.text == ''" v-bind:key="textarea.title" height="100%" :color="colors[i]">
            <v-img :src="circuit_image.url_image" id="image" alt="Circuit Image"/>
            <v-row class="fill-height" align="center" justify="center">
              <div class="pa-0">
                <v-col v-bind:key="textarea.title" class="col-12 white--text">
                  <p class="text_image float-left pa-1 font-weight-bold text-h4 text-md-h2 text-lg-h2 text-xl-h2" >{{ textarea.title }}</p>
                </v-col>
              </div>
            </v-row>
          </v-sheet>
          <v-sheet class="sheet" v-else v-bind:key="textarea.title" :color="colors[i]" height="100%">
            <v-row class="fill-height" align="center" justify="center">
              <div class="pa-0">
                <template v-for="(textarea) in slide">
                  <v-col v-bind:key="textarea.title" class="col-12 white--text">
                    <p class="float-left pa-0 font-weight-bold body-1 text-md-h4 text-lg-h4 text-xl-h4">{{ textarea.title }}</p>
                    <p class="float-left pl-5 body-1 text-md-h4 text-lg-h4 text-xl-h4">{{ textarea.text }}</p>
                  </v-col>
                </template>
              </div>
            </v-row>
          </v-sheet>
        </template>
      </v-carousel-item>
    </v-carousel>
    <a href="https://github.com/Thaniel/F1-APP" target="_blank">
      <v-img src="../../assets/github_icon_white.png" alt="Github logo" class="git_logo"/>
    </a>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";
import axios from "axios";
import {url_next_gp} from "@/store/constants";
import {getDateRace} from "@/store/common";
import {getImageCircuit} from "../../API/firebase";

export default {
  data(){
    return {
      response_gp: null,
      race_name: null,
      race:null,
      p1: null,
      p2: null,
      p3: null,
      qualify: null,
      info:[],
      circuit_image: null,
      colors: [
        '#111111',
        'blue darken-4',
        'teal darken-4',
        'red darken-4',
        'orange darken-4',
        'light-blue darken-1',

      ],
      slides: [
        'Bienvenido amante del motor',
        'Toda la información que necesitas',
        'Enterate de las últimas noticias',
        'Comparte tus opiniones',
        'Vota al mejor piloto',
      ],
    }
  },
  name: 'Home-view',
  components: {
    NavBar
  },
  created() {
    window.scrollTo(0,0)
    fb_functions.getAuthentication()

    axios.get(url_next_gp).then(response => {
      console.log(response)
      this.response_gp = response.data
      let textarea = {title: "", text: ""}
      let textarea_1 = {title: "", text: ""}
      let textarea_2 = {title: "", text: ""}
      let textarea_3 = {title: "", text: ""}
      let textarea_4 = {title: "", text: ""}
      let textarea_5 = {title: "", text: ""}
      textarea.title = this.response_gp.MRData.RaceTable.Races[0].raceName
      let list_1 = []
      list_1.push(textarea)
      this.info.push(list_1)

      textarea_1.title = 'Carrera'
      textarea_1.text = getDateRace(this.response_gp.MRData.RaceTable.Races[0].date, this.response_gp.MRData.RaceTable.Races[0].time)
      textarea_2.title = 'Clasificación'
      textarea_2.text = getDateRace(this.response_gp.MRData.RaceTable.Races[0].Qualifying.date, this.response_gp.MRData.RaceTable.Races[0].Qualifying.time)
      let list_2 = []
      list_2.push(textarea_1, textarea_2)
      this.info.push(list_2)

      textarea_3.title = 'Libres 1'
      textarea_3.text = getDateRace(this.response_gp.MRData.RaceTable.Races[0].FirstPractice.date, this.response_gp.MRData.RaceTable.Races[0].FirstPractice.time)
      textarea_4.title = 'Libres 2'
      textarea_4.text = getDateRace(this.response_gp.MRData.RaceTable.Races[0].SecondPractice.date, this.response_gp.MRData.RaceTable.Races[0].SecondPractice.time)
      if(this.response_gp.MRData.RaceTable.Races[0].ThirdPractice == null){
        textarea_5.title = 'Sprint'
        textarea_5.text = getDateRace(this.response_gp.MRData.RaceTable.Races[0].Sprint.date, this.response_gp.MRData.RaceTable.Races[0].Sprint.time)
      }else {
        textarea_5.title = 'Libres 3'
        textarea_5.text = getDateRace(this.response_gp.MRData.RaceTable.Races[0].ThirdPractice.date, this.response_gp.MRData.RaceTable.Races[0].ThirdPractice.time)
      }
      let list_3 = []
      list_3.push(textarea_3, textarea_4, textarea_5)
      this.info.push(list_3)
      console.log(this.response_gp)

      this.circuit_image = getImageCircuit(this.response_gp.MRData.RaceTable.Races[0].FirstPractice.date)
      console.log(this.circuit_image)
    })
  },
}
</script>

<style scoped>
.home{
  width: auto;
  height: 100%;
  background: #111111 !important;
}

#container{
  font-style: italic;
  width: 100%;
  padding-top: 120px !important;
  padding: 10%;
  display: inline-block;
  color: #D50000;
}
.git_logo{
  width: 5%;
  margin: 5% auto;
}

/*Una vez alcance los 1490px realizas el cambio*/
@media screen and (max-width: 800px) {
  .git_logo{
    width: 12%;
  }
}
.carousel{
  display: inline-block;
  margin-top: -10px !important;
}

@media screen and (max-width: 450px) {
  .carousel{
    height: 250px !important;
  }
  .sheet{
    height: 250px !important;
  }
}

img{
 filter: brightness(90%);
}

.contenedor{
  position: relative;
  display: inline-block;
  text-align: center;
}
.centrado{
  padding-top: 100px !important;
  position: absolute;
  top: 15%;
  left: 35%;
  transform: translate(-50%, -50%);
  color: #FFF;
  font-style: italic;
  font-family: "F1 Bold" !important;
}

.text_image{
  margin-top: 100px !important;
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #FFF;
  text-shadow: #111111 0.1em 0.1em 0.1em;
  font-family: "F1 Bold" !important;

}
.body-1, .text-md-h4, .text-lg-h4, .text-xl-h4{
  font-family: "F1 Regular" !important;
}
</style>