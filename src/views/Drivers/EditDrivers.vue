<template>
  <div class="editDrivers">
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> {{ snackbar_text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <NavBar></NavBar>
    <Dialog :visible="showDialog" @close="showDialog=false" @clicked="onClickChild" ref="myDialog"></Dialog>

    <div id="div_1">
      <v-card id="editDrivers_container" elevation="4" >
        <h1 class="ma-5 text-h4 text-md-h2 text-lg-h2 text-xl-h2">Pilotos</h1>
        <template v-for="d in drivers">
          <v-hover v-slot="{ hover }" v-bind:key="d.id" >
            <v-card class="mx-auto driver_container col"  :elevation="hover ? 24 : 4" :class="{ 'on-hover': hover }">
              <v-card-title >{{d.nombre + " " + d.apellidos}}</v-card-title>
              <div>
                <v-btn small class="button blue white--text body-1 ma-4" elevation="4" rounded @click="selectDriver(d.id)">
                  <v-icon small color="white">mdi-pencil</v-icon>
                </v-btn>
                <v-btn small class="button red accent-4 white--text body-1 ma-4" elevation="4" rounded  @click="$refs.myDialog.active('Eliminar Piloto', '¿Esta seguro de eliminar el piloto?.'), driver_selected = d.id">
                  <v-icon small color="white">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-card>
          </v-hover>

        </template>
        <v-btn class="button white--text button_volver body-2" elevation="4" rounded  @click="backToDrivers()">
          Volver
        </v-btn>
      </v-card>
    </div>

    <div id="div_2" hidden="true" class="ma-8">
      <v-form v-model="valid" class="mx-auto">
        <v-card class="container pa-0" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Editar el piloto</v-toolbar-title>
          </v-toolbar>
          <div class="ma-8">
            <v-text-field v-model="nombre" :rules="nombreRules" label="Nombre" required></v-text-field>
            <v-text-field v-model="apellidos" :rules="apellidosRules" label="Apellidos" required></v-text-field>
            <v-autocomplete v-model="pais" :rules="[() => !!pais || 'Introduzca la nacionalidad']" :items="countries" label="País" placeholder="Select..." required></v-autocomplete>

            <v-text-field v-model="mundiales" :rules="mundialesRules" label="Número de titulos de pilotos" required></v-text-field>
            <v-text-field v-model="puntos" :rules="puntosRules" label="Puntos" required></v-text-field>
            <v-autocomplete v-model="equipo" :items="teams_names" clearable label="Escudería" :rules="equipoRules"></v-autocomplete>

          </div>

          <div class="buttons_container_edit">
            <v-btn class="button white--text body-2 button_cancel" elevation="4" rounded  @click="cancel()">Cancelar</v-btn>
            <v-btn class="button red accent-4 white--text body-2 button_public" elevation="4" rounded :disabled="!valid" @click="updateDriver()">Actualizar</v-btn>
          </div>
        </v-card>
      </v-form>
    </div>
  </div>
</template>

<script>import Dialog from "../../components/Dialog";
import NavBar from "../../components/NavBar";
import * as fb_fucntions from "../../API/firebase";
import firebase from "firebase/app";
import {countries} from "../../store/constants";
import * as fb_functions from "../../API/firebase";

export default {
  components:{
    Dialog,
    NavBar,
  },
  name: "EditDrivers",
  data(){
    return {
      showDialog: false,
      snackbar: false,
      snackbar_text: '',
      snackbar_err: false,
      snackbar_err_text: '',
      driver_selected: '',
      permission: '',
      drivers: [],
      teams: [],
      teams_names: [],
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
      equipo: null,
      equipoRules: [
        v => !!v || 'Introduzca un piloto',
      ],
      valid: false
    }
  },
  created() {
    window.scrollTo(0,0)

    if(fb_fucntions.user_permission == ''){
      fb_functions.getAuthentication()
    }
    this.permission = fb_fucntions.user_permission

    if(this.drivers.length <= 0) {
      this.drivers = fb_fucntions.getDrivers()
    }

    if(this.teams.length <= 0){
      this.teams = fb_fucntions.getTeamNameId()
      let p = {nombre: '', id: ''}
      p.id = null
      p.nombre = "No especificar escudería"
      this.teams.push(p)
    }
  },
  methods: {
    /**********************************************
     *
     * Delete the team selected by the current user
     *
     *********************************************/
    // @vuese
    // Used to delete a driver
    // @arg The argument is a string value representing the driver identifier
    deleteDriver(driver_id){
      if(this.permission == true) {
        fb_fucntions.deleteDriver(driver_id)
        this.showSnackbar("Piloto eliminado")
      }
    },
    
    /**********************************************
     *
     * Edit the selected team
     *
     *********************************************/
    // @vuese
    // Used to show the selected driver for editing
    // @arg The argument is a string value representing the driver identifier
    selectDriver(driver_id){
      window.scrollTo(0,0);

      document.getElementById("div_2").hidden = false;
      document.getElementById("div_1").hidden = true;

      let index = this.drivers.findIndex(function(n) {
        if(n.id == driver_id)
          return true;
      })

      const db = firebase.firestore();

      //TODO cambiar llamada Firebase
      db.doc(this.drivers[index].equipo.path).get().then((doc2) =>{
        if (doc2.exists) {
          this.equipo = doc2.data().nombre
        }else {
          this.equipo = "No especificar escudería"
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });

      let i = 0;
      while (i < this.teams.length) {
        this.teams_names.push(this.teams[i].nombre)
        i++;
      }

      this.nombre = this.drivers[index].nombre
      this.apellidos = this.drivers[index].apellidos;
      this.pais = this.drivers[index].pais;
      this.mundiales = this.drivers[index].mundiales;
      this.id = this.drivers[index].id;
      this.puntos = this.drivers[index].puntos;
    },

    /**********************************************
     *
     * Update the changes into data base
     *
     *********************************************/
    // @vuese
    // Used to update driver data
    updateDriver(){
      if(this.permission == true){
        let i = 0
        let id_team = ''
        while (i < this.teams.length) {
          if(this.teams[i].nombre == this.equipo)
            id_team = this.teams[i].id
          i++;
        }

        fb_fucntions.editDriver(this.id, this.nombre, this.apellidos, this.pais, this.mundiales, this.puntos, id_team)
        this.showSnackbar("Piloto actualizado")

        document.getElementById("div_2").hidden = true;
        document.getElementById("div_1").hidden = false;
      }
    },
    
    /**********************************************
     *
     * Cancel the operation of editing a Driver
     *
     *********************************************/
    // @vuese
    // Used to cancel the operation to update driver data
    cancel(){
      document.getElementById("div_2").hidden = true;
      document.getElementById("div_1").hidden = false;
    },

    /**********************************************
     *
     * Go back to drivers
     *
     *********************************************/
    // @vuese
    // Used to go to the drivers page
    backToDrivers() {
      this.$router.push("/drivers");
    },

    // @vuese
    // Used to show snackbar alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar(cad){
      this.snackbar_text = cad
      this.snackbar = !this.snackbar;
    },

    // @vuese
    // Used to obtain the confirmation or cancellation response of the operation
    // @arg The argument is a string value representing the response the user's response
    onClickChild (value) {
      console.log(value)
      if(value == 'accept')
        this.deleteDriver(this.driver_selected)
    }
  }
}
</script>

<style scoped>

.editDrivers{
  margin-top: 48px;
  padding-top: 5%;
  padding-bottom: 5%;
  background-color: white;
  text-align: center;
}

h1 {
  color: #D50000;
}

#editDrivers_container{
  height: auto;
  margin: 0 5% 5% 5%;
  width: 90%;
  padding: 5%;
}

.button:hover{
  opacity: 0.8;
  cursor: pointer;
}

.button_volver{
  background-color: #212121 !important;
  margin-top: 8%;
  width: 45%;
}

.driver_container{
  display: inline-block;
  margin-top: 5%;
  border-left: 3px solid #2c3e50;
  text-align: left;
  padding-bottom: 5%;
}

.container{
  border-radius: 12px;
}

.buttons_container_edit{
  margin-top: 2%;
  margin-bottom: 5%;
  display: inline-block;
  width: 100%;
}

.button_public{
  background-color: #D50000 !important;
  margin-right: 0%;
  margin-left: 5%;
  color: white;
  width: 40%;
}
.button_cancel{
  background-color: #212121 !important;
  margin-right: 5%;
  width: 40%;
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