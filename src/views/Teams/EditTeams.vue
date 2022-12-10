<template>
  <div class="editTeams">
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
      <v-card id="editTeams_container" elevation="4" >
        <h1 class="ma-5 text-h4 text-md-h2 text-lg-h2 text-xl-h2">Escuderías</h1>
        <template v-for="t in teams">
          <v-hover v-slot="{ hover }" v-bind:key="t.id" >
            <v-card class="mx-auto team_container col" :elevation="hover ? 24 : 4" :class="{ 'on-hover': hover }">
              <v-card-title >{{t.nombre}}</v-card-title>
              <div>
                <v-btn small class="button blue white--text body-1 ma-4" elevation="4" rounded @click="selectTeam(t.id)">
                  <v-icon small color="white">mdi-pencil</v-icon>
                </v-btn>
                <v-btn small class="button red accent-4 white--text body-1 ma-4" elevation="4" rounded  @click="$refs.myDialog.active('Eliminar Escudería', '¿Esta seguro de eliminar la escudería?'), team_selected = t.id">
                  <v-icon small color="white">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-card>
          </v-hover>

        </template>
        <v-btn class="button white--text button_volver body-2" elevation="4" rounded  @click="backToTeams()">
          Volver
        </v-btn>
      </v-card>
    </div>

    <div id="div_2" hidden="true" class="ma-8">
      <v-form v-model="valid" class="mx-auto">
        <v-card class="container pa-0" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Editar la escudería</v-toolbar-title>
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

            <v-textarea v-model="descripcion" clearable clear-icon="mdi-close-circle" :rules="descripcionRules" label="Descripción del Gran Premio" value="..."></v-textarea>
          </div>

          <div class="buttons_container_edit">
            <v-btn class="button white--text body-2 button_cancel" elevation="4" rounded  @click="cancel()">Cancelar</v-btn>
            <v-btn class="button red accent-4 white--text body-2 button_public" elevation="4" rounded :disabled="!valid" @click="updateTeam()">Actualizar</v-btn>
          </div>
        </v-card>
      </v-form>
    </div>
  </div>
</template>

<script>
import Dialog from "../../components/Dialog";
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";
import firebase from "firebase/app";

export default {
  components:{
    Dialog,
    NavBar,
  },
  name: "EditTeams",
  data(){
    return {
      showDialog: false,
      team_selected: '',
      snackbar: false,
      snackbar_text: '',
      teams: [],
      drivers: [],
      drivers_surname: [],
      teamDrivers: [],
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
      mundiales_constructores: 0,
      mundiales_constructoresRules: [
        v => !!v || 'Introduzca el número de títulos de constructores',
      ],
      puntos: 0,
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
        v => !!v || 'Introduzca una descripción de la escudería',
      ],
      colours: ["azul oscuro", "azul claro", "azul", "amarillo", ""],
      valid: false
    }
  },
  created() {
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
     * Delete the team selected by the current user
     *
     *********************************************/
    // @vuese
    // Used to delete a team
    // @arg The argument is a string value representing the team identifier
    deleteTeam(team_id){
      if(this.permission == true) {
        fb_functions.deleteTeam(team_id)
        this.showSnackbar("Escudería eliminada")
      }
    },

    /**********************************************
     *
     * Edit the selected team
     *
     *********************************************/
    // @vuese
    // Used to show the selected team for editing
    // @arg The argument is a string value representing the team identifier
    selectTeam(team_id){
      window.scrollTo(0,0);

      document.getElementById("div_2").hidden = false;
      document.getElementById("div_1").hidden = true;

      let index = this.teams.findIndex(function(n) {
        if(n.id == team_id)
          return true;
      })
      //this.teamDrivers = fb_functions.getSurnameOfTeamDrivers(this.teams[index].ref_piloto1.path, this.teams[index].ref_piloto2.path)
      const db = firebase.firestore();

      //TODO cambiar llamada Firebase
      db.doc(this.teams[index].ref_piloto1.path).get().then((doc2) =>{
        if (doc2.exists) {
          this.piloto_1 = doc2.data().apellidos
        }else {
          this.piloto_1 = "No especificar piloto"
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });

      db.doc(this.teams[index].ref_piloto2.path).get().then((doc2) =>{
        if (doc2.exists) {
          this.piloto_2 = doc2.data().apellidos
        }else {
          this.piloto_2 = "No especificar piloto"
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });

      let i = 0;
      while (i < this.drivers.length) {
        this.drivers_surname.push(this.drivers[i].apellidos_p)
        i++;
      }

      this.nombre = this.teams[index].nombre
      this.nombre_completo = this.teams[index].nombre_completo;
      this.jefe_equipo = this.teams[index].jefe_equipo;
      this.mundiales_constructores = this.teams[index].mundiales_constructores;
      this.id = this.teams[index].id;
      this.puntos = this.teams[index].puntos;
      this.codigo =this.teams[index].codigo;
      this.descripcion =this.teams[index].descripcion;
    },

    /**********************************************
     *
     * Update the changes into data base
     *
     *********************************************/
    // @vuese
    // Used to update team data
    updateTeam(){
      if(this.permission == true){
        let i = 0
        let id_piloto_1 = ''
        let id_piloto_2 = ''
        while (i < this.drivers.length) {
          if(this.drivers[i].apellidos_p == this.piloto_1)
            id_piloto_1 = this.drivers[i].id
          if(this.drivers[i].apellidos_p == this.piloto_2)
            id_piloto_2 = this.drivers[i].id
          i++;
        }
        fb_functions.editTeam(this.id, this.nombre, this.nombre_completo, this.jefe_equipo, this.mundiales_constructores, this.puntos, this.codigo, id_piloto_1, id_piloto_2, this.descripcion)
        this.showSnackbar("Escudería actualizada")

        document.getElementById("div_2").hidden = true;
        document.getElementById("div_1").hidden = false;
      }
    },

    /**********************************************
     *
     * Cancel the operation of editing a Team
     *
     *********************************************/
    // @vuese
    // Used to cancel the operation to update team data
    cancel(){
      document.getElementById("div_2").hidden = true;
      document.getElementById("div_1").hidden = false;
    },

    /**********************************************
     *
     * Go back to teams
     *
     *********************************************/
    // @vuese
    // Used to go to the teams page
    backToTeams() {
      this.$router.push("/teams");
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
        this.deleteTeam(this.team_selected)
    }
  }
}
</script>

<style scoped>

.editTeams{
  margin-top: 48px;
  padding-top: 5%;
  padding-bottom: 5%;
  background-color: white;
  text-align: center;
}

h1 {
  color: #D50000;
}

#editTeams_container{
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

.team_container{
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