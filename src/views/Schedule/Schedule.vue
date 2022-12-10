<template>
  <div class="schedule">
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> Gran Premio publicado
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbar_err" top :multi-line=true color="error"> No tienes permisos
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar_err = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <NavBar></NavBar>

    <v-card id="main_container" elevation="5">
      <h1 id="title" class="text-uppercase font-italic font-weight-bold text-h4 text-md-h1 text-lg-h1 text-xl-h1">CALENDARIO</h1>
    </v-card>

    <v-layout id="main_buttons_container">
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="expand = !expand" v-if="this.permission==true">Crear GP</v-btn>
      </v-col>
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="showEditSchedule()" v-if="this.permission==true">Editar GP</v-btn>
      </v-col>
    </v-layout>

    <v-expand-transition>
      <v-form v-show="expand" v-model="valid" class="mx-auto">
        <v-card id="container_create" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Publicar un Gran Premio</v-toolbar-title>
          </v-toolbar>
          <div class="ma-8">
            <v-text-field v-model="gran_premio" :rules="gran_premioRules" label="Gran Premio" required></v-text-field>
            <v-text-field v-model="circuito" :rules="circuitoRules" label="Circuito" required></v-text-field>
            <v-text-field v-model="pais" :rules="paisRules" label="Pais" required></v-text-field>

            <v-dialog ref="dialog" v-model="modal" :return-value.sync="fecha" persistent width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="fecha" label="Fecha de inicio" readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="fecha" scrollable>
                <v-spacer></v-spacer>
                <v-btn text color="second" @click="modal = false">Cancelar</v-btn>
                <v-btn text color="primary" @click="$refs.dialog.save(fecha)">OK</v-btn>
              </v-date-picker>
            </v-dialog>

            <v-text-field v-model="horario_carrera" :rules="horario_carreraRules" label="Horario de la carrera (Día - Hora)" required></v-text-field>
            <v-text-field v-model="horario_clasi" :rules="horario_clasiRules" label="Horario de la clasificacion (Día - Hora)" required></v-text-field>
            <v-text-field v-model="aparicion_c" :rules="aparicion_cRules" label="Primera aparición del Gran Premio (Año)" required></v-text-field>
            <v-text-field v-model="carrera_dist_c" :rules="carrera_dist_cRules" label="Longitud total de la carrera (Km)" required></v-text-field>
            <v-text-field v-model="vueltas_c" :rules="vueltas_cRules" label="Vueltas de la carrera" required></v-text-field>
            <v-text-field v-model="record_c" :rules="record_cRules" label="Record del circuito [Tiempo Piloto (Año)]" required></v-text-field>
            <v-text-field v-model="tamanno_c" :rules="tamanno_cRules" label="Longitud del circuito (Km)" required></v-text-field>
            <v-textarea v-model="descripcion" clearable clear-icon="mdi-close-circle" :rules="descripcionRules" label="Descripción del Gran Premio" value="..."></v-textarea>
            <v-file-input v-model="selectedFile" accept="image/*" counter label="Imagen del circuito" :rules="imageRules" prepend-icon="mdi-camera"></v-file-input>
          </div>

          <div id="buttonsCreate_container">
            <v-btn class="button body-1" id="button_cancel" elevation="4" rounded @click="expand = !expand">Cancelar</v-btn>
            <v-btn class="button body-1" id="button_public" elevation="4" rounded :disabled="!valid" @click="createGP()">Publicar</v-btn>
          </div>
        </v-card>
      </v-form>
    </v-expand-transition>

    <v-card id="schedule_container" elevation="5">
      <template v-for="r in races">
        <v-hover v-slot="{ hover }" v-bind:key="r.id" >
          <v-flex class="col-12 col-md-6 col-lg-4 col-xl-3">
            <v-card class="mx-auto gp_container" :elevation="hover ? 24 : 2" :class="{ 'on-hover': hover }" @click="showDetailsSchedule(r.id)">
              <img height="180" :src="r.foto_gp" id="image" alt="F1 Circuit">
              <v-card-title class="v-card__title text-uppercase font-weight-bold">GP DE {{r.pais}}</v-card-title>
              <v-card-text class="text--primary ">{{r.fecha}}</v-card-text>
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
      expand: false,
      races: [],
      permission: '',
      current_user: '',
      modal: false,
      gran_premio: '',
      gran_premioRules: [
        v => !!v || 'Introduzca el nombre del Gran Premio',
      ],
      circuito: '',
      circuitoRules: [
        v => !!v || 'Introduzca el nombre del circuito',
      ],
      pais: '',
      paisRules: [
        v => !!v || 'Introduzca el país',
      ],
      fecha: '',
      horario_clasi: '',
      horario_clasiRules: [
        v => !!v || 'Introduzca el horario de la clasificacion',
      ],
      horario_carrera: '',
      horario_carreraRules: [
        v => !!v || 'Introduzca el horario de la carrera',
      ],
      aparicion_c: '',
      aparicion_cRules: [
        v => !!v || 'Introduzca el año de la primera aparición del Gran Premio',
      ],
      tamanno_c: '',
      tamanno_cRules: [
        v => !!v || 'Introduzca la longitud del circuito',
      ],
      record_c: '',
      record_cRules: [
        v => !!v || 'Introduzca el record del circuito',
      ],
      vueltas_c: '',
      vueltas_cRules: [
        v => !!v || 'Introduzca el número de vueltas de la carrera',
      ],
      carrera_dist_c: '',
      carrera_dist_cRules:[
        v => !!v || 'Introduzca la longitud total de la carrera',
      ],
      descripcion: '',
      descripcionRules: [
        v => !!v || 'Introduzca la descripción el Gran Premio',
      ],
      selectedFile: null,
      imageRules: [
        v => !!v || 'Introduzca una imagen del circuito',
      ],
    }
  },
  name: "Schedule-view",
  components: {
    NavBar
  },

  /**********************************************
   *
   * Firestore Real-Time
   *
   *********************************************/
  created() {
    window.scrollTo(0,0)

    this.current_user = localStorage.getItem('USER_NAME')
    if(fb_functions.user_permission == ''){
      fb_functions.getAuthentication()
    }
    this.permission = fb_functions.user_permission

    if(this.races.length <= 0) {
      this.races = fb_functions.getSchedule()
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
          this.selectedFile = files[0] // this is an image file that can be sent to server...
        })
      }
    },

    /**********************************************
     *
     * Create a new GP
     *
     *********************************************/
    // @vuese
    // Used to create a Grand Prix
    createGP(){
      if(this.permission == true){

        // Image name
        let array_cad = this.selectedFile.name.split(".")
        let date_extension = getDate('/')
        let folder_path = '/Circuits/' + array_cad[0] + date_extension + '.' + array_cad[1]

        fb_functions.addGrandPrix(this.gran_premio, this.circuito, this.pais, this.fecha,
            this.horario_clasi, this.horario_carrera, this.aparicion_c, this.tamanno_c,
            this.record_c, this.vueltas_c, this.carrera_dist_c, this.descripcion, folder_path, this.selectedFile)

        this.snackbar = !this.snackbar;
        this.expand = !this.expand;
      }
    },

    /**********************************************
     *
     * Go to Edit Schedule
     *
     *********************************************/
    // @vuese
    // Used to go to the edit schedule page
    showEditSchedule(){
      if(this.permission == true){  // Go to edit schedule
        this.$router.push('/edit-schedule')
      }
      else {                          // User does not have permission
        this.snackbar_err = !this.snackbar_err;
      }
    },

    /**********************************************
     *
     * Shows the details of a Grand Prix
     *
     *********************************************/
    // @vuese
    // Used to go to the details schedule page
    // @arg The argument is a string value representing the Gran Prix identifier
    showDetailsSchedule(id) {
      this.$router.push({path: '/schedule/schedule-details/' + id, params: {id : this.id}})
    },
  }
}
</script>

<style scoped>
.schedule{
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

#schedule_container{
  margin: 20px 0;
  width: 90%;
  background-color: #fff;
  display: inline-block;
}

.gp_container{
  background-color: #f5f5f5;
  text-align: left;
  margin: 5% 3% !important;
  color: black;
  border-bottom: 3px solid #D50000;
  padding: 0;
}

.gp_container:hover{
  cursor: pointer;
  border-bottom: 3px solid #2c3e50;
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