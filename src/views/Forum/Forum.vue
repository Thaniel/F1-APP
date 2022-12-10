<template>
  <div class="forum">

    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> Tema creado
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <NavBar></NavBar>

    <v-card id="main_container" elevation="5">
      <h1 id="title" class="text-uppercase font-italic font-weight-bold text-h4 text-md-h1 text-lg-h1 text-xl-h1">FORO</h1>
    </v-card>

    <v-layout id="main_buttons_container">
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="expand = !expand">Crear tema</v-btn>
      </v-col>
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="showMyThemes()">Mis temas</v-btn>
      </v-col>
    </v-layout>

    <v-expand-transition>
      <v-form v-show="expand" v-model="valid" class="mx-auto">
        <v-card id="container_create" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Publicar un tema</v-toolbar-title>
          </v-toolbar>
          <div class="ma-8">
            <v-text-field v-model="titulo" :rules="titleRules" label="Título del tema" required></v-text-field>
            <v-textarea v-model="comentario" clearable clear-icon="mdi-close-circle" :rules="comentarioRules" label="Escriba un comentario acerca del tema" value="..."></v-textarea>
          </div>
          <div id="buttonsCreate_container">
            <v-btn class="button body-2" id="button_cancel" elevation="4" rounded @click="expand = !expand">Cancelar</v-btn>
            <v-btn class="button body-2" id="button_public" elevation="4" rounded :disabled="!valid" @click="createTheme()">Publicar</v-btn>
          </div>
        </v-card>
      </v-form>
    </v-expand-transition>

    <v-card id="themes_container" elevation="5">

      <v-card class="header_themes" elevation="3">
        <v-layout>
          <v-col>
            <h1 class="text-subtitle-2 text-md-h5 text-lg-h5 text-xl-h5 info_header white--text">Titulo</h1>
          </v-col>
          <v-col>
            <h1 class="text-subtitle-2 text-md-h5 text-lg-h5 text-xl-h5 info_header white--text">Autor</h1>
          </v-col>
          <v-col>
            <h1 class="text-subtitle-2 text-md-h5 text-lg-h5 text-xl-h5 info_header white--text">Comentarios</h1>
          </v-col>
        </v-layout>
      </v-card>

      <template v-for="t in themes">
        <v-hover v-slot="{ hover }" v-bind:key="t.id" >
          <v-card class="mx-auto theme_container" :elevation="hover ? 8 : 2" :class="{ 'on-hover': hover }" @click="showComments(t.id, t.titulo, t.autor)">
            <v-layout>
              <v-col>
                <h1 class="text-subtitle-2 text-md-h5 text-lg-h5 text-xl-h5">{{t.titulo}}</h1>
              </v-col>
              <v-col>
                <h1 class="text-subtitle-2 text-md-h5 text-lg-h5 text-xl-h5">{{t.autor}}</h1>
              </v-col>
              <v-col >
                <h1 class="text-subtitle-2 text-md-h5 text-lg-h5 text-xl-h5">{{t.n_comentarios}}</h1>
              </v-col>
            </v-layout>
          </v-card>
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
  name: "Forum-view",
  data() {
    return {
      expand: false,
      snackbar: false,
      valid: false,
      themes: [],
      current_user:'',
      titulo: '',
      titleRules: [
        v => !!v || 'Introduzca el título del tema',
      ],
      comentario: '',
      comentarioRules: [
        v => !!v || 'Introduzca un comentario acerca del tema',
      ],
    }
  },
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

    if(this.themes.length <= 0) {
      this.themes = fb_functions.getThemes()
    }
  },
  methods:{
    /**********************************************
     *
     * Create a new theme
     *
     *********************************************/
    // @vuese
    // Used to create a theme
    createTheme(){
      if (this.titulo.length <= 0 || this.comentario.length <= 0) {
        alert("Por favor, rellene todos los campos para crear un tema")
      } else {
        let date = getDate('/')
        this.current_user = localStorage.getItem('USER_NAME')

        fb_functions.addTheme (this.titulo, this.current_user, date, this.comentario)

        this.snackbar = !this.snackbar
        this.expand = !this.expand
      }
    },

    /**********************************************
     *
     * Show the comments of a theme
     *
     *********************************************/
    // @vuese
    // Used to go to the comments page
    // @arg The arguments are three string value representing the identifier, title and author of the comment
    showComments(id, title, author) {
      this.$router.push({path: '/forum/comments/', query: {id : id, title : title, author : author}})
    },

    /**********************************************
     *
     * Show user themes
     *
     *********************************************/
    // @vuese
    // Used to go to the user's themes page
    showMyThemes(){
      this.$router.push('/my-forum')
    },
  }
}
</script>

<style scoped>
.forum{
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

#themes_container {
  width: 90%;
  background-color: #fff;
  display: inline-block;
  padding-bottom: 2%;
  margin-bottom: 5%;
}

.theme_container{
  color: #2c3e50;
  margin: 2.5% 2% !important;
  width: 96% !important;
  display: inline-block;
  background: linear-gradient(0deg, rgba(207,202,202,1) 0%, rgba(255,255,255,1) 10%, rgba(255,255,255,1) 100%);
  padding: 2% 2%;
  border-left: 3px solid #D50000;
}

.theme_container:hover{
  cursor: pointer;
  border-left: 3px solid #2c3e50;
  background-color: #ddddff;
}

.header_themes{
  margin-bottom: 5%;
  background-color: #333333;
}

.info_header{
  margin-top: 3%;
  margin-bottom: 3%;
}

#container_create{
  width: 90%;
  margin: 5%;
  border-radius: 12px;
}

#buttonsCreate_container{
  margin-bottom: 5%;
  margin-top: 5%;
  display: inline-block;
  width: 100%;
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

h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2{
  font-family: "F1 Regular" !important;
}

</style>