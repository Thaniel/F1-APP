<template>
  <div class="drivers">
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> Piloto publicado
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
      <h1 id="title" class="text-uppercase font-italic font-weight-bold text-h4 text-md-h1 text-lg-h1 text-xl-h1">PILOTOS</h1>
    </v-card>

    <v-layout id="main_buttons_container">
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="showCreateDriver()" v-if="this.permission==true">Crear Piloto</v-btn>
      </v-col>
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="showEditDrivers()" v-if="this.permission==true">Editar Piloto</v-btn>
      </v-col>
    </v-layout>

    <v-expand-transition>
      <v-form v-show="expand" v-model="valid" class="mx-auto">
        <v-card id="container_create" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Publicar un piloto</v-toolbar-title>
          </v-toolbar>
          <div class="ma-8">
            <v-text-field v-model="nombre" :rules="nombreRules" label="Nombre" required></v-text-field>
            <v-text-field v-model="apellidos" :rules="apellidosRules" label="Apellidos" required></v-text-field>
            <v-autocomplete v-model="pais" :rules="[() => !!pais || 'Introduzca la nacionalidad']" :items="countries" label="País" placeholder="Select..." required></v-autocomplete>
            <v-text-field v-model="mundiales" :rules="mundialesRules" label="Número de titulos de pilotos" required></v-text-field>
            <v-text-field v-model="puntos" :rules="puntosRules" label="Puntos" required></v-text-field>
            <v-autocomplete v-model="equipo" :items="teams_names" clearable label="Escudería" :rules="equipoRules"></v-autocomplete>

            <v-file-input v-model="selectedFile_1" accept="image/*" counter label="Imagen del piloto" :rules="imageRules" prepend-icon="mdi-camera"></v-file-input>
            <!--<v-file-input v-model="selectedFile_2" accept="image/*" counter label="Logo del piloto" :rules="imageRules" prepend-icon="mdi-camera"></v-file-input>-->
          </div>

          <div id="buttonsCreate_container">
            <v-btn class="button body-2" id="button_cancel" elevation="4" rounded @click="expand = !expand">Cancelar</v-btn>
            <v-btn class="button body-2" id="button_public" elevation="4" rounded :disabled="!valid" @click="createDriver()">Publicar</v-btn>
          </div>
        </v-card>
      </v-form>
    </v-expand-transition>

    <v-card id="drivers_container" elevation="5">
      <template v-for="d in drivers">
        <v-hover v-slot="{ hover }" v-bind:key="d.id" >
          <v-flex class="col-12 col-md-6 col-lg-4 col-xl-3">
            <v-card class="mx-auto driver_container" :id="d.codigo" :elevation="hover ? 24 : 2" :class="{ 'on-hover': hover }" @click="showDetailsDriver(d.id)">
              <img height="300" :src="d.foto_piloto" id="image" alt="F1 Driver">
              <v-card-title class="text-h5 text-uppercase" >{{d.nombre + " " + d.apellidos}}</v-card-title>
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
import {countries} from "../../store/constants";

export default {
  data(){
    return {
      valid: false,
      snackbar: false,
      snackbar_err: false,
      snackbar_err_text: '',
      drivers: [],
      teams: [],
      teams_names: [],
      permission: '',
      expand: false,
      nombre: '',
      nombreRules: [
        v => !!v || 'Introduzca el nombre del piloto',
      ],
      apellidos: '',
      apellidosRules: [
        v => !!v || 'Introduzca los apellidos del piloto',
      ],
      pais: '',
      countries: countries,
      mundiales: '',
      mundialesRules: [
        v => !!v || 'Introduzca el número de títulos de pilotos',
      ],
      puntos: '',
      puntosRules: [
        v => !!v || 'Introduzca el número de puntos',
      ],
      selectedFile_1: null,
      imageRules: [
        v => !!v || 'Introduzca una imagen',
      ],
      selectedFile_2: null,
      equipo: null,
      equipoRules: [
        v => !!v || 'Introduzca un piloto',
      ],

    }
  },
  name: "Drivers-view",
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

    if(this.drivers.length <= 0) {
      this.drivers = fb_functions.getDrivers()
    }

    if(this.teams.length <= 0){
      this.teams = fb_functions.getTeamNameId()
      let p = {nombre: '', id: ''}
      p.id = null
      p.nombre = "No especificar escudería"
      this.teams.push(p)
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
          //this.selectedFile_2 = files[1]
        })
      }
    },

    // @vuese
    // Used to display the driver creation form
    showCreateDriver(){
      this.expand = !this.expand
      let i = 0;
      while (i < this.teams.length) {
        this.teams_names.push(this.teams[i].nombre)
        i++;
      }
    },

    /**********************************************
     *
     * Create a new Driver
     *
     *********************************************/
    // @vuese
    // Used to create a driver
    createDriver(){
      if(this.permission == true){

        // Image name
        let array_cad = this.selectedFile_1.name.split(".")
        let date_extension = getDate('-')
        let folder_path_1 = '/Drivers/'+array_cad[0]+date_extension+'.'+array_cad[1]

        // Image name
        /*
        array_cad = this.selectedFile_2.name.split(".")
        date_extension = getDate('-')
        let folder_path_2 = '/DriverLogo/'+array_cad[0]+date_extension+'.'+array_cad[1]
        */

        // Drivers id
        let i = 0;
        let id_team = '';
        while (i < this.teams.length) {
          if(this.teams[i].nombre == this.equipo)
            id_team = this.teams[i].id
          i++;
        }

      fb_functions.addDriver(this.nombre, this.apellidos, this.pais, this.mundiales, this.puntos, id_team, this.selectedFile_1,  folder_path_1)

        this.snackbar = !this.snackbar;
        this.expand = !this.expand;
      }
    },

    /**********************************************
     *
     * Go to Edit Drivers
     *
     *********************************************/
    // @vuese
    // Used to go to the edit drivers page
    showEditDrivers(){
      if(this.permission == true){  // Go to edit drivers
        this.$router.push('/edit-drivers')
      }
      else {                          // User does not have permission
        this.showSnackbar_err("No tienes permisos")
      }
    },

    // @vuese
    // Used to go to the details driver page
    // @arg The argument is a string value representing the driver identifier
    showDetailsDriver(id){
      this.$router.push({path: '/drivers/driver-details/' + id, params: {id : this.id}})
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

.drivers{
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
  font-family: "F1 Bold" !important;
}

#drivers_container {
  margin: 20px 0;
  width: 90%;
  background-color: #fff;
  display: inline-block;
}

.driver_container{
  text-align: left;
  margin: 5% 5% !important;
  color: black;
  padding: 0;
}

.driver_container:hover{
  cursor: pointer;
  background-color: #ddddff;
}

img{
  width: 100%;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 90%);
  object-fit: cover;
  object-position: 100% 5%;
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