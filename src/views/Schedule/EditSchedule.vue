<template>
  <div class="editSchedule">
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
      <v-card id="editSchedule_container" elevation="4" >
        <h1 class="ma-5 text-h4 text-md-h2 text-lg-h2 text-xl-h2">Grandes Premios</h1>
        <template v-for="r in races">
          <v-hover v-slot="{ hover }" v-bind:key="r.id" >
            <v-card class="mx-auto gp_container col" :elevation="hover ? 24 : 4" :class="{ 'on-hover': hover }">
              <v-card-title >GP de {{r.pais}}</v-card-title>
              <v-card-text class="text--primary">{{r.gran_premio}}</v-card-text>
              <div>
                <v-btn small class="button blue white--text body-1 ma-4" elevation="4" rounded @click="selectedGP(r.id)">
                  <v-icon small color="white">mdi-pencil</v-icon>
                </v-btn>
                <v-btn small class="button red accent-4 white--text body-1 ma-4" elevation="4" rounded  @click="$refs.myDialog.active('Eliminar Gran Premio', '¿Esta seguro de eliminar el Gran Premio?'), gp_selected = r.id">
                  <v-icon small color="white">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-card>
          </v-hover>

        </template>
        <v-btn class="button white--text button_volver body-1" elevation="4" rounded  @click="backToSchedule()">
          Volver
        </v-btn>
      </v-card>
    </div>

    <div id="div_2" hidden="true" class="ma-8">
      <v-form v-model="valid" class="mx-auto">
        <v-card class="container pa-0" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Editar el Gran Premio</v-toolbar-title>
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
          </div>

          <div class="buttons_container_edit">
            <v-btn class="button white--text body-2 button_cancel" elevation="4" rounded  @click="cancel()">Cancelar</v-btn>
            <v-btn class="button red accent-4 white--text body-2 button_public" elevation="4" rounded :disabled="!valid" @click="updateGP()">Actualizar</v-btn>
          </div>
        </v-card>
      </v-form>
    </div>
  </div>
</template>

<script>
import * as fb_functions from "../../API/firebase";
import Dialog from "../../components/Dialog";
import NavBar from "../../components/NavBar";

export default {
  components:{
    Dialog,
    NavBar,
  },
  name: "EditSchedule",
  data(){
    return {
      snackbar: false,
      snackbar_text: '',
      showDialog: false,
      gp_selected: '',
      races: [],
      permission: '',
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
      foto_gp: null,
      valid: false
    }
  },
  created() {
    window.scrollTo(0,0)
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
     * Delete the GP selected
     *
     *********************************************/
    // @vuese
    // Used to delete a Grand Prix
    // @arg The argument is a string value representing the Grand Prix identifier
    deleteGP(gp_id){
      if(this.permission == true){
        fb_functions.deleteGrandPrix(gp_id)
        this.showSnackbar("Gran Premio eliminado")
      }
    },

    /**********************************************
     *
     * Edit the selected GP
     *
     *********************************************/
    // @vuese
    // Used to show the selected Grand Prix for editing
    // @arg The argument is a string value representing the Grand Prix identifier
    selectedGP(gp_id){
      window.scrollTo(0,0);
      document.getElementById("div_2").hidden = false;
      document.getElementById("div_1").hidden = true;

      let index = this.races.findIndex(function(n) {
        if(n.id == gp_id)
          return true;
      })

      this.gran_premio = this.races[index].gran_premio
      this.circuito = this.races[index].circuito
      this.pais = this.races[index].pais
      this.fecha = this.races[index].fecha
      this.horario_clasi = this.races[index].horario_clasi
      this.horario_carrera = this.races[index].horario_carrera
      this.aparicion_c = this.races[index].aparicion_c
      this.tamanno_c = this.races[index].tamanno_c
      this.record_c = this.races[index].record_c
      this.vueltas_c = this.races[index].vueltas_c
      this.carrera_dist_c = this.races[index].carrera_dist_c
      this.descripcion = this.races[index].descripcion
      this.foto_gp = this.races[index].foto_gp;
      this.id = this.races[index].id;
    },

    /**********************************************
     *
     * Update the changes into data base
     *
     *********************************************/
    // @vuese
    // Used to update Grand Prix data
    updateGP(){
      if(this.permission == true) {
        fb_functions.editGrandPrix(this.id, this.gran_premio, this.circuito, this.pais, this.fecha, this.horario_clasi, this.horario_carrera,
            this.aparicion_c, this.tamanno_c, this.record_c, this.vueltas_c, this.carrera_dist_c, this.descripcion, this.foto_gp, this.foto_gp)

        this.showSnackbar("Gran Premio actualizado")

        document.getElementById("div_2").hidden = true;
        document.getElementById("div_1").hidden = false;
      }
    },

    /**********************************************
     *
     * Cancel the operation of editing a GP
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
     * Go back to schedule
     *
     *********************************************/
    // @vuese
    // Used to go to the schedule page
    backToSchedule() {
      this.$router.push("/schedule");
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
        this.deleteGP(this.gp_selected)
    }
  }
}
</script>

<style scoped>
.editSchedule{
  margin-top: 48px;
  padding-top: 5%;
  padding-bottom: 5%;
  background-color: white;
  text-align: center;
}

h1 {
  color: #D50000;
}

#editSchedule_container{
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

.gp_container{
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