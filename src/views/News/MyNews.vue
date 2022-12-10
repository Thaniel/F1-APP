<template>
  <div class="myNews">
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
      <v-card id="myNews_container" elevation="4" >
        <h1 class="ma-5 text-h4 text-md-h2 text-lg-h2 text-xl-h2">Mis noticias</h1>
        <template v-for="n in myNews">
          <v-hover v-slot="{ hover }" v-bind:key="n.id" >
            <v-card class="mx-auto notice_container col" :elevation="hover ? 24 : 4" :class="{ 'on-hover': hover }">
              <v-card-title >{{n.titulo}}</v-card-title>
              <v-card-text class="text--primary">{{n.resumen}}</v-card-text>
              <div>
                <v-btn small class="button blue white--text body-1 ma-4" elevation="4" rounded @click="selectNew(n.id)">
                  <v-icon small color="white">mdi-pencil</v-icon>
                </v-btn>
                <v-btn small class="button red accent-4 white--text body-1 ma-4" elevation="4" rounded  @click="$refs.myDialog.active('Eliminar noticia', '¿Esta seguro de eliminar la noticia?'), notice_selected = n.id">
                  <v-icon small color="white">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-card>
          </v-hover>

        </template>
        <v-btn class="button white--text button_volver body-2" elevation="4" rounded  @click="backToNews()">
          Volver
        </v-btn>
      </v-card>
    </div>

    <div id="div_2" hidden="true" class="ma-8">
      <v-form v-model="valid" class="mx-auto">
        <v-card class="container pa-0" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Editar una noticia</v-toolbar-title>
          </v-toolbar>
          <div class="ma-8">
            <v-text-field v-model="titulo" :rules="titleRules" label="Titulo" required></v-text-field>
            <v-text-field v-model="resumen" :rules="resumeRules" label="Resumen" required></v-text-field>
            <v-textarea v-model="texto" clearable clear-icon="mdi-close-circle" :rules="textoRules" label="Comnetario sobre la noticia"></v-textarea>
          </div>
          <div class="buttons_container_edit">
            <v-btn class="button white--text body-2 button_cancel" elevation="4" rounded  @click="cancel()">Cancelar</v-btn>
            <v-btn class="button red accent-4 white--text body-2 button_public" elevation="4" rounded :disabled="!valid" @click="updateNew()">Actualizar</v-btn>
          </div>
        </v-card>
      </v-form>
    </div>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import Dialog from "../../components/Dialog";
import * as fb_functions from "../../API/firebase";

export default {
  components:{
    Dialog,
    NavBar,
  },
  name: "MyNews",
  data(){
    return {
      valid: false,
      snackbar: false,
      snackbar_text: '',
      showDialog: false,
      notice_selected: '',
      my_news: [],
      current_user: '',
      id: '',
      url_foto: '',
      titulo: '',
      titleRules: [
        v => !!v || 'Introduzca el título de la noticia',
      ],
      resumen: '',
      resumeRules: [
        v => !!v || 'Introduzca un resumen de la noticia',
      ],
      texto: '',
      textoRules: [
        v => !!v || 'Introduzca el comentario de la noticia',
      ],
      autor: '',
      fecha: '',
    }
  },
  created() {
    window.scrollTo(0,0)

    this.current_user = localStorage.getItem('USER_NAME')
    if(fb_functions.user_permission == ''){
      fb_functions.getAuthentication()
    }
    this.permission = fb_functions.user_permission

    if(this.my_news.length <= 0) {
      this.my_news = fb_functions.getNews()
    }
  },
  computed: {
    myNews(){
      return this.my_news.filter(n => {
        return n.autor === this.current_user
      })
    }
  },
  methods:{
    /**********************************************
     *
     * Delete the new selected by the current user
     *
     *********************************************/
    // @vuese
    // Used to delete a new
    // @arg The argument is a string value representing the new identifier
    deleteNew(notice_id){
      if(this.permission == true) {
        fb_functions.deleteNew(notice_id)
        this.showSnackbar("Noticia eliminada")
      }
    },

    /**********************************************
     *
     * Edit the selected new
     *
     *********************************************/
    // @vuese
    // Used to show the selected new for editing
    // @arg The argument is a string value representing the new identifier
    selectNew(notice_id){
      window.scrollTo(0,0);
      document.getElementById("div_2").hidden = false;
      document.getElementById("div_1").hidden = true;

      let index = this.my_news.findIndex(function(n) {
        if(n.id == notice_id)
          return true;
      })
      this.titulo = this.my_news[index].titulo
      this.resumen = this.my_news[index].resumen;
      this.texto = this.my_news[index].texto;
      this.autor = this.my_news[index].autor;
      this.id = this.my_news[index].id;
      this.fecha = this.my_news[index].fecha;
      this.url_foto =this.my_news[index].url_foto;
    },

    /**********************************************
     *
     * Go back to news
     *
     *********************************************/
    // @vuese
    // Used to go to the news page
    backToNews() {
      this.$router.push("/news");
    },

    /**********************************************
     *
     * Cancel the operation of editing a new
     *
     *********************************************/
    // @vuese
    // Used to cancel the operation to update new data
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
    // Used to update new data
    updateNew(){
      if(this.permission == true){

        fb_functions.editNew(this.id, this.titulo, this.resumen, this.texto, this.autor, this.fecha, this.url_foto)
        this.showSnackbar("Noticia actualizada")

        document.getElementById("div_2").hidden = true;
        document.getElementById("div_1").hidden = false;
      }
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
        this.deleteNew(this.notice_selected)
    }
  }
}
</script>

<style scoped>
.myNews{
  margin-top: 48px;
  padding-top: 5%;
  padding-bottom: 5%;
  background-color: white;
  text-align: center;
}

h1 {
  color: #D50000;
}

#myNews_container{
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

.notice_container{
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
.body-1, .body-2 {
  font-family: "F1 Regular" !important;
}
</style>