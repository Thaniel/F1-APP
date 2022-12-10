<template>
  <div class="table">
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> {{ snackbar_text}}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="reload()" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbar_err" top :multi-line=true color="error"> {{ snackbar_err_text}}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar_err = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <NavBar></NavBar>

    <v-card id="main_container" elevation="5">
      <h1 id="title" class="text-uppercase font-italic font-weight-bold text-h4 text-md-h1 text-lg-h1 text-xl-h1">CLASIFICACION</h1>
    </v-card>

    <v-layout class="ma-2">
      <v-col>
        <v-btn class="ma-sm body-1" small elevation="4" @click="updateRanking()" v-if="this.permission==true" color="primary">Actualizar</v-btn>
      </v-col>
    </v-layout>
    <v-btn-toggle id="buttons_container" v-model="toggle_exclusive" mandatory color="red accent-4" >
      <v-btn class="option_button text-subtitle-1 text-md-h5 text-lg-h5 text-xl-h5" elevation="4" @click="showTableTeams()">Escuderías</v-btn>
      <v-btn class="option_button text-subtitle-1 text-md-h5 text-lg-h5 text-xl-h5" elevation="4" @click="showTableDrivers()">Pilotos</v-btn>
    </v-btn-toggle>

    <div id="div_1">
      <v-card class="classification" elevation="4">
        <v-card class="header_classification" elevation="3">
          <v-layout>
            <v-col >
              <h1 class="text-caption text-md-h5 text-lg-h5 text-xl-h5 white--text">Escuderia</h1>
            </v-col>
            <v-col >
              <h1 class="text-caption text-md-h5 text-lg-h5 text-xl-h5 white--text">Puntos</h1>
            </v-col>
          </v-layout>
        </v-card>
        <template v-for="t in table_teams">
          <div class="element" :class="t.codigo" :key="t.nombre">
              <v-layout>
                <v-col>
                  <h1 class="names_col text-md-body-1 text-lg-body-1 text-xl-body-1 text-left ml-5">{{t.nombre}}</h1>
                </v-col>
                <v-col>
                  <h1 class="points_col text-md-body-1 text-lg-body-1 text-xl-body-1">{{t.puntos}}</h1>
                </v-col>
              </v-layout>
          </div>
        </template>
      </v-card>
    </div>

    <div id="div_2">
      <v-card class="classification" elevation="4">
        <v-card class="header_classification" elevation="3">
          <v-layout>
            <v-col >
              <h1 class="text-caption text-md-h5 text-lg-h5 text-xl-h5 white--text">Piloto</h1>
            </v-col>
            <v-col >
              <h1 class="text-caption text-md-h5 text-lg-h5 text-xl-h5 white--text">Puntos</h1>
            </v-col>
          </v-layout>
        </v-card>
        <template v-for="d in table_drivers">
          <div class="element" :class="d.codigo" v-bind:key="d.nombre">
            <v-layout>
              <v-col>
                <h1 class="names_col text-md-body-1 text-lg-body-1 text-xl-body-1 text-left ml-5">{{d.nombre + " " + d.apellidos}}</h1>
              </v-col>
              <v-col>
                <h1 class="points_col text-md-body-1 text-lg-body-1 text-xl-body-1">{{d.puntos}}</h1>
              </v-col>
            </v-layout>
          </div>
        </template>
      </v-card>
    </div>

  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";
import {url_constructors, url_drivers} from "../../store/constants";
import axios from "axios";
import {removeAccents} from "../../store/common";
import firebase from "firebase";
const db = firebase.firestore();

export default {
  mounted: function () {
    this.showTableTeams();
  },
  data(){
    return {
      snackbar: false,
      snackbar_text: '',
      snackbar_err: false,
      snackbar_err_text: '',
      permission: '',
      table_teams: [],
      table_drivers: [],
      toggle_exclusive: undefined,
      response_constructors: null,
      response_drivers: null,
    }
  },
  name: "Table-view",
  components: {
    NavBar
  },
  created() {
    window.scrollTo(0,0)

    if(fb_functions.user_permission == ''){
      fb_functions.getAuthentication()
    }
    this.permission = fb_functions.user_permission

    if(this.table_teams.length <= 0){
      this.table_teams = fb_functions.getTeamsRanking()
    }

    if(this.table_drivers.length <= 0){
      this.table_drivers = fb_functions.getDriversRanking()
    }

  },

  methods:{
    // @vuese
    // Used to show team rankings
    showTableTeams() {
      document.getElementById("div_1").hidden = false
      document.getElementById("div_2").hidden = true
    },

    // @vuese
    // Used to show drivers rankings
    showTableDrivers() {
      document.getElementById("div_1").hidden = true
      document.getElementById("div_2").hidden = false
    },
    /**********************************************
     *
     * Update drivers and teams ranking
     *
     *********************************************/
    // @vuese
    // Used to update the team and driver rankings
    updateRanking(){

      let last_race = -1; //fb_functions.getLastUpdateRanking()
      db.collection("info").doc("carreras").get().then((doc) =>{
        if (doc.exists) {
          last_race = doc.data().numero
          axios.get(url_constructors).then(response => {
            this.response_constructors = response.data
            if(this.response_constructors.MRData.StandingsTable.StandingsLists[0].round <= last_race){
              this.showSnackbar_err("Ya está actualizada la clasificación")
            }else{
              let i = 0
              let constructors = []
              while (i < this.response_constructors.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.length) {
                let c = {codigo: '', puntos: ''}
                c.codigo = this.response_constructors.MRData.StandingsTable.StandingsLists[0].ConstructorStandings[i].Constructor.constructorId
                c.puntos = this.response_constructors.MRData.StandingsTable.StandingsLists[0].ConstructorStandings[i].points
                constructors.push(c)
                i++;
              }
              fb_functions.updateTeamsRanking(this.getTeamsId(constructors))
              this.showSnackbar("Clasificación de escuderías actualizada")

            }
          }).catch(error => {
            this.showSnackbar_err("Error: " + url_constructors)
            console.log(error)
          })

          axios.get(url_drivers).then(response => {
            this.response_drivers = response.data
            //console.log("round: " + this.response_drivers.MRData.StandingsTable.StandingsLists[0].round + " last_race: " + last_race)
            if(this.response_drivers.MRData.StandingsTable.StandingsLists[0].round <= last_race){
              this.showSnackbar_err("Ya está actualizada la clasificación")
            }else {
              let i = 0
              let drivers = []
              while (i < this.response_drivers.MRData.StandingsTable.StandingsLists[0].DriverStandings.length) {
                let d = {codigo: '', puntos: ''}
                d.codigo = removeAccents(this.response_drivers.MRData.StandingsTable.StandingsLists[0].DriverStandings[i].Driver.familyName)
                d.puntos = this.response_drivers.MRData.StandingsTable.StandingsLists[0].DriverStandings[i].points
                drivers.push(d)
                i++;
              }

              fb_functions.updateDriversRanking(this.getDirversId(drivers))
              this.showSnackbar("Clasificación de pilotos actualizada")
              fb_functions.setLastUpdateRanking(this.response_constructors.MRData.StandingsTable.StandingsLists[0].round)
            }
          }).catch(error => {
            this.showSnackbar_err("Error: " + url_drivers)
            console.log(error)
          })
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      })
    },

    // @vuese
    // Used to get team identifiers
    getTeamsId(teams){
      let list = []
      let i = 0

      while (i < teams.length) {
        let c = {id: '', puntos: ''}
        let found = this.table_teams.find(element => element.codigo === teams[i].codigo)
        c.id = found.id
        c.puntos = teams[i].puntos
        list.push(c)
        i++;
      }

      return list
    },

    // @vuese
    // Used to get driver identifiers
    getDirversId(drivers){
      let list = []
      let i = 0

      while (i < drivers.length) {
        let d = {id: '', puntos: ''}
        let found = this.table_drivers.find(element => element.apellidos === drivers[i].codigo)
        d.id = found.id
        d.puntos = drivers[i].puntos
        list.push(d)
        i++;
      }

      return list
    },

    // @vuese
    // Used to show snackbar alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar(cad){
      this.snackbar_text = cad
      this.snackbar = true
    },

    // @vuese
    // Used to show snackbar error alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar_err(cad){
      this.snackbar_err_text = cad
      this.snackbar_err = true
    },

    // @vuese
    // Used to reload the page
    reload(){
      this.snackbar = false
      location.reload()
    }
  }
}
</script>

<style scoped>
@import "../../assets/styles/leftContainer.css";

.table{
  margin-top: 48px;
  background-color: white;
  text-align: center;
}

#main_container{
  width: 100%;
  background-color: #D50000;
  display: inline-block;
}

#title{
  margin-top: 0;
  padding-top: 5%;
  padding-left: 5.5%;
  padding-bottom: 5%;
  color: white;
  text-align: left;
}

#buttons_container{
  margin: 5% 0 0 0;
  width: 80%;
}

.option_button{
  float: left;
  width: 50% !important;
  margin: 0 !important;
  border: 0 !important;
}

.element{
  margin-top: 1%;
  margin-bottom: 1%;
  color: #2c3e50;
  width: 95%;
  display: inline-block;
  background: linear-gradient(0deg, rgba(207,202,202,1) 0%, rgba(255,255,255,1) 10%, rgba(255,255,255,1) 100%);
}

.classification{
  height: auto;
  margin: 5% 5% 5% 5%;
  width: 90%;
  padding: 2%;
}

.header_classification{
  margin-bottom: 2%;
  padding-top: 2%;
  padding-bottom: 2%;
  display: inline-block;
  width: 100%;
  background-color: #333333;
}
.names_col, .points_col{
  font-size: 10px;
  font-weight: normal;
}

h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2, .text-caption, .text-md-body-1, .text-lg-body-1, .text-xl-body-1{
  font-family: "F1 Regular" !important;
}
</style>