<template>
  <div class="vote" >
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> {{ snackbar_text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbar_err" top :multi-line=true color="error"> {{ snackbar_err_text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar_err = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <NavBar></NavBar>
    <Dialog :visible="showDialog" @close="showDialog=false" @clicked="onClickChild" ref="myDialog"></Dialog>

    <v-card id="main_container" elevation="5" class="pt-6">
      <h1 id="title" class="text-uppercase font-italic font-weight-bold text-h4 text-md-h1 text-lg-h1 text-xl-h1">VOTACIONES</h1>
    </v-card>

    <v-layout id="main_buttons_container">
      <v-col>
        <v-btn class="ma-sm main_button caption" elevation="4" @click="expand_create = !expand_create" v-if="this.permission==true" v-show="!btn_state">Abrir Votacion</v-btn>
        <v-btn class="ma-sm main_button caption" elevation="4" @click="closeVote()" v-if="this.permission==true" v-show="btn_state">Cerrar Votacion</v-btn>
      </v-col>
    </v-layout>

    <v-expand-transition>
      <v-form v-show="expand_create" v-model="valid" class="mx-auto">
        <v-card id="container_create" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Publicar una votación</v-toolbar-title>
          </v-toolbar>
          <div class="ma-8">
            <v-text-field v-model="nombre_gp" :rules="nombre_gpRules" label="País del Gran Premio" required></v-text-field>
             </div>
          <div id="buttonsCreate_container">
            <v-btn class="button body-1" id="button_cancel" elevation="4" rounded @click="expand_create = !expand_create">Cancelar</v-btn>
            <v-btn class="button body-1" id="button_public" elevation="4" rounded :disabled="!valid" @click="openVote()">Abrir</v-btn>
          </div>
        </v-card>
      </v-form>
    </v-expand-transition>

    <v-container id="main_buttons_container">
      <v-layout class="ma-5">
        <v-btn large width="80%" height="70" block class="ma-sm main_button text-h6" elevation="8" @click="showAllVotes()">Ver votaciones</v-btn>
      </v-layout>
      <v-layout class="ma-5">
        <v-btn large width="80%" height="70" block class="ma-sm main_button text-h6" elevation="8" v-show="btn_state" @click="showDrivers()">Votar</v-btn>
      </v-layout>
    </v-container>

    <v-expand-transition>
      <v-card id="container" elevation="10" v-show="expand">
        <v-toolbar flat color="#2c3e50" dark>
          <v-toolbar-title>Elige un piloto</v-toolbar-title>
        </v-toolbar>
        <template v-for="d in drivers">
          <v-hover v-slot="{ hover }" v-bind:key="d.id" >
            <v-flex class="col-12 col-md-6 col-lg-4 col-xl-3">
              <v-card class="mx-auto driver_container" :id="d.codigo" :elevation="hover ? 24 : 2" :class="{ 'on-hover': hover }" @click="$refs.myDialog.active('Realizar voto', '¿Está seguro de votar al piloto seleccionado?'), driver_selected = d.id">
                <img height="200" :src="d.foto_piloto" id="image" alt="F1 Driver">
                <v-card-title class="text-h5" >{{d.nombre + " " + d.apellidos}}</v-card-title>
              </v-card>
            </v-flex>
          </v-hover>
        </template>
      </v-card>
    </v-expand-transition>

  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import firebase from "firebase/app";
import * as fb_functions from "../../API/firebase";
import {getDateWithoutTime} from "../../store/common";
import Dialog from "../../components/Dialog";

export default {
  name: "Vote-view",
  data(){
    return {
      showDialog: false,
      snackbar: false,
      snackbar_text: '',
      snackbar_err: false,
      snackbar_err_text: '',
      drivers: [],
      driver_selected: '',
      expand: false,
      btn_state: false,
      active_vote: null,
      permission: null,
      nombre_gp: '',
      nombre_gpRules: [
        v => !!v || 'Introduzca el nombre el país',
      ],
      expand_create: false,
      valid: false
    }
  },
  components:{
    Dialog,
    NavBar,
  },
  created() {
    window.scrollTo(0,0);

    if(fb_functions.user_permission == ''){
      fb_functions.getAuthentication()
    }
    this.permission = fb_functions.user_permission

    //TODO firebase
    const db = firebase.firestore()

    // Check if there is an active vote
    db.collection("votaciones").where('estado', '==', 'activa').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.exists){
          this.btn_state = true
          this.active_vote  = doc.id
        } else {
          this.btn_state = false
        }
      })
    })
  },
  methods:{
    /**********************************************
     *
     * Get and show all drivers
     *
     *********************************************/
    // @vuese
    // Used to show all drivers
    showDrivers() {
      this.expand = !this.expand

      if(this.drivers.length <= 0) {
        this.drivers = fb_functions.getDrivers()
      }
    },

    /**********************************************
     *
     * Vote for a driver
     *
     *********************************************/
    //TODO firebase
    // @vuese
    // Used to vote for a driver
    // @arg The argument is a string value representing the driver identifier
    voteDriver(identifier){
      const db = firebase.firestore()

      let user = localStorage.getItem("USER_NAME")

      // Check if the user has already voted
      db.collection("votaciones").doc(this.active_vote).collection("votos_realizados").doc(user).get().then((doc2) => {
        if (doc2.exists) {
          this.showSnackbar_err("Ya has votado")
        } else {
          // Add vote into the sub-collection
          let my_vote = db.collection("votaciones").doc(this.active_vote).collection("votos").doc(identifier)
          my_vote.update({
            numero: firebase.firestore.FieldValue.increment(1)
          }).then(() => {
            db.collection("votaciones").doc(this.active_vote).collection("votos_realizados").doc(user).set({
              votado: true
            }).then(() => {
              db.collection("votaciones").doc(this.active_vote).update({
                contador: firebase.firestore.FieldValue.increment(1)
              })
              this.showSnackbar("Voto realizado")
            }).catch((error) => {
              console.error("Error writing document: ", error);
            })
          }).catch((error) => {
            console.error("Error writing document: ", error);
          })
        }
      }).catch((error) => {
        console.error("Error getting document:", error)
      })

      this.expand = !this.expand
    },

    /**********************************************
     *
     * Open a new vote
     *
     *********************************************/
    // @vuese
    // Used to create and activate a new vote
    openVote(){
      // create subcollection votos votos_realizados
      let date = getDateWithoutTime('/')
      fb_functions.open_vote(this.nombre_gp, date)
      this.showSnackbar("Nueva votación activa")
      this.expand_create = false
    },

    /**********************************************
     *
     * Close active vote
     *
     *********************************************/
    // @vuese
    // Used to close active voting
    closeVote(){
      if(this.active_vote != null){
        fb_functions.close_vote(this.active_vote)
        this.showSnackbar("Votación cerrada")
      }else{
        this.showSnackbar_err("No hay ninguna votación activa")
      }
    },

    /**********************************************
     *
     * Show all votes from all GP
     *
     *********************************************/
    // @vuese
    // Used to go to the all votes page
    showAllVotes(){
      this.$router.push('/all-votes')
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
    // Used to obtain the confirmation or cancellation response of the operation
    // @arg The argument is a string value representing the response the user's response
    onClickChild (value) {
      console.log(value)
      if(value == 'accept')
        this.voteDriver(this.driver_selected)
    }
  }
}
</script>

<style scoped>
@import "../../assets/styles/bottomContainer.css";

.vote{
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

#container_create{
  width: 90%;
  margin: 5%;
  border-radius: 12px;
}

#button_public{
  background-color: #D50000;
  margin-right: 0%;
  margin-left: 5%;
  color: white;
  width: 40%;
}

#button_cancel{
  background-color: #212121;
  margin-right: 5%;
  color: white;
  width: 40%;
}

#buttonsCreate_container{
  margin-top: 5%;
  margin-bottom: 5%;
  display: inline-block;
  width: 100%;
}

#main_buttons_container{
  margin-top: 3%;
  margin-bottom: 3%;
}

.main_button{
  background-color: #D50000 !important;
  color: white;
}

.main_button:hover {
  background-color: #2c3e50 !important;
  color: white !important;
  cursor: pointer;
}

#container{
  width: 90%;
  margin: -20px 0%;
  border-radius: 12px;
  display: inline-block;
}

.driver_container{
  background-color: #f5f5f5;
  text-align: left;
  margin: 5% 5% !important;
  color: black;
  border-bottom: 3px solid #D50000;
  padding: 0;
}

.driver_container:hover{
  cursor: pointer;
  border-bottom: 3px solid #2c3e50;
  background-color: #ddddff;
}

img{
  width: 100%;
  height: 100%;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 90%);
  object-fit: cover;
  object-position: 100% 5%;
}

[class*="col"] {
  float: left;
}

h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2, .caption{
  font-family: "F1 Regular" !important;
}
</style>