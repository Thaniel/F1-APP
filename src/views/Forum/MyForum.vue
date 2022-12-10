<template>
  <div class="myForum">
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
      <v-card id="myForum_container" elevation="4">
        <h1 class="ma-5 text-h4 text-md-h2 text-lg-h2 text-xl-h2">Mis temas</h1>
        <template v-for="t in my_themes">
          <v-card v-bind:key="t.id" class="mx-auto theme_container col">
            <v-card-title> {{ t.titulo }} </v-card-title>
              <v-btn small class="button blue white--text body-1 ma-4" elevation="4" rounded @click="selectTheme(t.id)">
                <v-icon small color="white">mdi-pencil</v-icon>
              </v-btn>
              <v-btn small class="button red accent-4 white--text body-1 ma-4" elevation="4" rounded @click="$refs.myDialog.active('Eliminar tema', '¿Esta seguro de eliminar el tema?. Si elimina el tema se borrarán también todos sus comentarios'), theme_selected = t.id">
                <v-icon small color="white">mdi-delete</v-icon>
              </v-btn>
          </v-card>

        </template>
        <v-btn class="button white--text button_volver body-2" elevation="4" rounded  @click="backToThemes()">
          Volver
        </v-btn>
      </v-card>
    </div>
    <div id="div_2" hidden="true" class="ma-8">
      <v-form v-model="valid" class="mx-auto">
        <v-card class="container pa-0" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Editar un tema</v-toolbar-title>
          </v-toolbar>
          <div class="ma-8">
            <v-text-field v-model="titulo" :rules="titleRules" label="Titulo" required></v-text-field> </div>
          <div class="buttons_container_edit">
            <v-btn class="button white--text body-2 button_cancel" elevation="4" rounded  @click="cancel()">Cancelar</v-btn>
            <v-btn class="button red accent-4 white--text body-2 button_public" elevation="4" rounded :disabled="!valid" @click="updateTheme()">Actualizar</v-btn>
          </div>
        </v-card>
      </v-form>
    </div>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";
import Dialog from "../../components/Dialog";

export default {
  name: "MyForum",
  components:{
    NavBar,
    Dialog
  },
  data(){
    return {
      showDialog: false,
      snackbar: false,
      snackbar_text: '',
      theme_selected: '',
      my_themes: [],
      current_user: '',
      id: '',
      titulo: '',
      titleRules: [
        v => !!v || 'Introduzca el título de la noticia',
      ],
      valid: false
    }
  },
  /**********************************************
   *
   * Firestore Real-Time
   *
   *********************************************/
  created() {
    window.scrollTo(0, 0)

    this.current_user = localStorage.getItem('USER_NAME')
    if(fb_functions.user_permission == ''){
      fb_functions.getAuthentication()
    }
    this.permission = fb_functions.user_permission

    if(this.my_themes.length <= 0) {
      this.my_themes = fb_functions.getUserThemes(this.current_user)
    }
  },
  methods: {
    /**********************************************
     *
     * Delete the theme selected by user
     *
     *********************************************/
    // @vuese
    // Used to delete a theme
    // @arg The argument is a string value representing the theme identifier
    deleteTheme(theme_id) {

      fb_functions.deleteTheme(theme_id)
      this.showSnackbar("Tema eliminado")
      this.dialog = false
    },

    /**********************************************
     *
     * Edit the selected new
     *
     *********************************************/
    // @vuese
    // Used to show the selected theme for editing
    // @arg The argument is a string value representing the theme identifier
    selectTheme(theme_id){
      window.scrollTo(0,0);
      document.getElementById("div_2").hidden = false;
      document.getElementById("div_1").hidden = true;

      let index = this.my_themes.findIndex(function(n) {
        if(n.id == theme_id)
          return true;
      })
      this.titulo = this.my_themes[index].titulo
      this.id = this.my_themes[index].id;
    },

    /**********************************************
     *
     * Cancel the operation of editing a theme
     *
     *********************************************/
    // @vuese
    // Used to cancel the operation to update theme data
    cancel(){
      document.getElementById("div_2").hidden = true;
      document.getElementById("div_1").hidden = false;
    },

    /**********************************************
     *
     * Update the changes into data base
     *
     *********************************************/
    // @vuese
    // Used to update theme data
    updateTheme(){
        fb_functions.editTheme(this.id, this.titulo)
        this.showSnackbar("Tema actualizado")

        document.getElementById("div_2").hidden = true;
        document.getElementById("div_1").hidden = false;
    },
    /**********************************************
     *
     * Go back to themes
     *
     *********************************************/
    // @vuese
    // Used to go to the forum page
    backToThemes() {
      this.$router.push("/forum")
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
      if(value == 'accept')
        this.deleteTheme(this.theme_selected)
    }
  }
}
</script>

<style scoped>
.myForum{
  margin-top: 48px;
  padding-top: 5%;
  padding-bottom: 5%;
  background-color: white;
  min-height: 1000px;
  text-align: center;
}

h1 {
  color: #D50000;
}

#myForum_container{
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

.theme_container{
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
  background-color: #D50000;
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