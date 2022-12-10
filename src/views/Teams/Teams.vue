<template>
  <div class="teams">
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> Escudería publicada
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbar_err" top :multi-line=true color="error"> {{ snackbar_err_text }}}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar_err = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <NavBar></NavBar>

    <v-card id="main_container" elevation="5">
      <h1 id="title" class="text-uppercase font-italic font-weight-bold text-h4 text-md-h1 text-lg-h1 text-xl-h1">ESCUDERIAS</h1>
    </v-card>

    <v-layout id="main_buttons_container">
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="showCreateTeam()" v-if="this.permission==true">Crear Equipo</v-btn>
      </v-col>
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="showEditTeams()" v-if="this.permission==true">Editar Equipo</v-btn>
      </v-col>
    </v-layout>

    <v-expand-transition>
      <v-form v-show="expand" v-model="valid" class="mx-auto">
        <v-card id="container_create" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Publicar una escudería</v-toolbar-title>
          </v-toolbar>
          <div class="ma-8">
            <v-text-field v-model="nombre" :rules="nombreRules" label="Nombre" required></v-text-field>
            <v-text-field v-model="nombre_completo" :rules="nombre_completoRules" label="Nombre completo" required></v-text-field>
            <v-text-field v-model="jefe_equipo" :rules="jefe_equipoRules" label="Jefe de equipo" required></v-text-field>

            <v-text-field v-model="mundiales_constructores" :rules="mundiales_constructoresRules" label="Número de titulos de constructores" required></v-text-field>
            <v-text-field v-model="puntos" :rules="puntosRules" label="Puntos" required></v-text-field>
            <v-text-field v-model="codigo" :rules="codigoRules" label="Identificador de la escudería" required></v-text-field>
            <v-autocomplete v-model="piloto_1" :items="drivers_surname" clearable label="Primer piloto" :rules="pilotoRules"></v-autocomplete>
            <v-autocomplete v-model="piloto_2" :items="drivers_surname" clearable label="Segundo piloto" :rules="pilotoRules"></v-autocomplete>

            <v-textarea v-model="descripcion" clearable clear-icon="mdi-close-circle" :rules="descripcionRules" label="Descripción de la escudería" value="..."></v-textarea>
            <v-file-input v-model="selectedFile_1" accept="image/*" counter label="Imagen del coche" :rules="imageRules" prepend-icon="mdi-camera"></v-file-input>
            <v-file-input v-model="selectedFile_2" accept="image/*" counter label="Logo del equipo" :rules="imageRules" prepend-icon="mdi-camera"></v-file-input>
          </div>

          <div id="buttonsCreate_container">
            <v-btn class="button body-2" id="button_cancel" elevation="4" rounded @click="expand = !expand">Cancelar</v-btn>
            <v-btn class="button body-2" id="button_public" elevation="4" rounded :disabled="!valid" @click="createTeam()">Publicar</v-btn>
          </div>
        </v-card>
      </v-form>
    </v-expand-transition>

    <v-card id="teams_container" elevation="5">
      <template v-for="t in teams">
        <v-hover v-slot="{ hover }" v-bind:key="t.id" >
          <v-flex class="col-12 col-md-6 col-lg-6 col-xl-6">
            <v-card class="mx-auto team_container" :id="t.codigo" :elevation="hover ? 24 : 2" :class="{ 'on-hover': hover}" @click="showDetailsTeam(t.id)">
              <img :src="t.foto_coche" id="image" alt="F1 Car">
              <v-card-title class="text-uppercase text-h5">{{t.nombre}}</v-card-title>
            </v-card>
          </v-flex>
        </v-hover>
      </template>
    </v-card>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";
import {getDate} from "../../store/common";

export default {
  data(){
    return {
      valid: false,
      snackbar: false,
      snackbar_err: false,
      snackbar_err_text: '',
      expand: false,
      teams: [],
      drivers: [],
      drivers_surname: [],
      permission: '',
      nombre: '',
      nombreRules: [
        v => !!v || 'Introduzca el nombre de la escudería',
      ],
      nombre_completo: '',
      nombre_completoRules: [
        v => !!v || 'Introduzca el nombre completo de la escudería',
      ],
      jefe_equipo: '',
      jefe_equipoRules: [
        v => !!v || 'Introduzca el nombre del jefe de equipo',
      ],
      mundiales_constructores: '',
      mundiales_constructoresRules: [
        v => !!v || 'Introduzca el número de títulos de constructores',
      ],
      puntos: '',
      puntosRules: [
        v => !!v || 'Introduzca el número de puntos',
      ],
      codigo: '',
      codigoRules: [
        v => !!v || 'Introduzca el identificador de la escudería',
      ],
      selectedFile_1: null,
      imageRules: [
        v => !!v || 'Introduzca una imagen',
      ],
      selectedFile_2: null,
      piloto_1: null,
      piloto_2: null,
      pilotoRules: [
        v => !!v || 'Introduzca un piloto',
      ],
      descripcion: '',
      descripcionRules: [
        v => !!v || 'Introduzca una descripción de la ecudería',
      ],
      colours: ["azul oscuro", "azul claro", "azul", "amarillo", ""]
    }
  },
  name: "Teams-view",
  components: {
    NavBar
  },

  /**********************************************
   *
   * Firestore Real-Time
   *
   *********************************************/
  created(){
    window.scrollTo(0,0)
    if(fb_functions.user_permission == ''){
      fb_functions.getAuthentication()
    }
    this.permission = fb_functions.user_permission

    if(this.teams.length <= 0) {
      this.teams = fb_functions.getTeams()
    }

    if(this.drivers.length <= 0){
      this.drivers = fb_functions.getDriversNameId()
      let p = {nombre_p: '', apellidos_p: '', id: ''}
      p.id = null
      p.apellidos_p = "No especificar piloto"
      this.drivers.push(p)
    }
  },
  methods: {
    /**********************************************
     *
     * Obtain the image uploaded
     *
     *********************************************/
    // @vuese
    // Used to get the file uploaded by the user
    onFileSelected(event) {
      const files = event.target.files
      if (files[0] !== undefined) {
        const fr = new FileReader()
        fr.readAsDataURL(files[0])
        fr.addEventListener('load', () => {
          this.selectedFile_1 = files[0] // this is an image file that can be sent to server...
          this.selectedFile_2 = files[1]
        })
      }
    },

    // @vuese
    // Used to display the team creation form
    showCreateTeam(){
      this.expand = !this.expand
      let i = 0;
      while (i < this.drivers.length) {
        this.drivers_surname.push(this.drivers[i].apellidos_p)
        i++;
      }
    },
    /**********************************************
     *
     * Create a new Team
     *
     *********************************************/
    // @vuese
    // Used to create a team
    createTeam(){

      if(this.piloto_1 == this.piloto_2 && this.piloto_1 != 'No especificar piloto' && this.piloto_2 != 'No especificar piloto'){
        this.showSnackbar_err('No puedes seleccionar 2 pilotos iguales')
      }else if(this.permission == true){

        // Image name
        let array_cad = this.selectedFile_1.name.split(".")
        let date_extension = getDate('-')
        let folder_path_1 = '/Cars/'+array_cad[0]+date_extension+'.'+array_cad[1]

        // Image name
        array_cad = this.selectedFile_2.name.split(".")
        date_extension = getDate('-')
        let folder_path_2 = '/Teams/'+array_cad[0]+date_extension+'.'+array_cad[1]

        // Drivers id
        let i = 0;
        let id_piloto_1 = ''
        let id_piloto_2 = ''
        while (i < this.drivers.length) {
          if(this.drivers[i].apellidos_p == this.piloto_1)
            id_piloto_1 = this.drivers[i].id
          if(this.drivers[i].apellidos_p == this.piloto_2)
            id_piloto_2 = this.drivers[i].id
          i++;
        }

        fb_functions.addTeam(this.nombre, this.nombre_completo, this.jefe_equipo,this.mundiales_constructores, this.puntos, this.codigo,
            this.selectedFile_1, this.selectedFile_2, id_piloto_1, id_piloto_2, this.descripcion, folder_path_1, folder_path_2)

        this.snackbar = !this.snackbar;
        this.expand = !this.expand;
      }
    },

    /**********************************************
     *
     * Go to Edit Teams
     *
     *********************************************/
    // @vuese
    // Used to go to the edit teams page
    showEditTeams(){
      if(this.permission == true){  // Go to edit teams
        this.$router.push('/edit-teams')
      }
      else {                          // User does not have permission
        this.showSnackbar_err("No tienes permisos")
      }
    },

    /**********************************************
     *
     * Shows the details of a team
     *
     *********************************************/
    // @vuese
    // Used to go to the details team page
    // @arg The argument is a string value representing the team identifier
    showDetailsTeam(id) {
      this.$router.push({path: '/teams/team-details/' + id, params: {id : this.id}})
    },

    // @vuese
    // Used to show snackbar error alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar_err(cad){
      this.snackbar_err_text = cad
      this.snackbar_err =! this.snackbar_err
    },
  }
}
</script>

<style scoped>
@import "../../assets/styles/bottomContainer.css";

.teams{
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

#teams_container {
  margin: 20px 0;
  width: 90%;
  background-color: #fff;
  display: inline-block;
}

.team_container{
  background-color: #f5f5f5;
  text-align: left;
  margin: 5% 5% !important;
  color: black;
  padding: 0;
}

.team_container:hover{
  cursor: pointer;
  background-color: #ddddff;
}

img{
  width: 100%;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 90%);
  object-fit: cover;
}

[class*="col"] {
  float: left;
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

h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2{
  font-family: "F1 Regular" !important;
}
</style>