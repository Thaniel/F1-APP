<template>
  <div class="news">
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> Noticia publicada
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
      <h1 id="title" class="text-uppercase font-italic font-weight-bold text-h4 text-md-h1 text-lg-h1 text-xl-h1">NOTICIAS</h1>
    </v-card>

    <v-layout id="main_buttons_container">
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="expand = !expand" v-if="this.permission==true">Crear noticia</v-btn>
      </v-col>
      <v-col>
        <v-btn class="ma-sm main_button body-2" elevation="4" @click="showMyNews()" v-if="this.permission==true">Mis noticias</v-btn>
      </v-col>
    </v-layout>

    <v-expand-transition>
      <v-form v-show="expand" v-model="valid" class="mx-auto">
        <v-card id="container_create" elevation="10">
          <v-toolbar flat color="#2c3e50" dark>
            <v-toolbar-title>Publicar una noticia</v-toolbar-title>
          </v-toolbar>
          <div class="ma-8">
            <v-text-field v-model="titulo" :rules="titleRules" label="Titulo" required></v-text-field>
            <v-text-field v-model="resumen" :rules="resumeRules" label="Resumen" required></v-text-field>
            <v-textarea v-model="texto" clearable clear-icon="mdi-close-circle" :rules="textoRules" label="Comnetario sobre la noticia" value="..."></v-textarea>
            <v-file-input v-model="selectedFile" accept="image/*" counter label="Imagen de la noticia" :rules="imageRules" prepend-icon="mdi-camera"></v-file-input>
          </div>
          <div id="buttonsCreate_container">
            <v-btn class="button body-2" id="button_cancel" elevation="4" rounded @click="expand = !expand">Cancelar</v-btn>
            <v-btn class="button body-2" id="button_public" elevation="4" rounded :disabled="!valid" @click="createNew()">Publicar</v-btn>
          </div>
        </v-card>
      </v-form>
    </v-expand-transition>

    <v-card id="news_container" elevation="5">
      <template v-for="n in news">
        <v-hover v-slot="{ hover }" :key="n.id" >
          <v-flex class="col-12 col-md-6 col-lg-4 col-xl-3">
            <v-card class="mx-auto notice_container" :elevation="hover ? 24 : 2" :class="{ 'on-hover': hover }" @click="showDetails(n.id)">
              <img height="200" :src="n.url_foto" id="image" alt="New image"/>
              <v-card-title>{{n.titulo}}</v-card-title>
              <v-card-subtitle>{{n.fecha}}</v-card-subtitle>
              <v-card-text class="text--primary">{{n.resumen}}</v-card-text>
            </v-card>
          </v-flex>
        </v-hover>
      </template>
    </v-card>
  </div>
</template>


<script>
import NavBar from "../../components/NavBar";
import {getDate} from "../../store/common";
import * as fb_functions from "../../API/firebase";

export default {
  name: "News-view",
  data(){
    return {
      valid: false,
      snackbar: false,
      snackbar_err: false,
      news: [],
      permission: '',
      current_user: '',
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
      selectedFile: null,
      imageRules: [
        v => !!v || 'Introduzca una imagen de la noticia',
      ],
      expand: false,
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

    window.scrollTo(0,0);
    this.current_user = localStorage.getItem('USER_NAME')
    if(fb_functions.user_permission == ''){
      fb_functions.getAuthentication()
    }
    this.permission = fb_functions.user_permission

    if(this.news.length <= 0) {
      this.news = fb_functions.getNews()
    }
  },
  methods:{
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
     * Get user data and create a new
     *
     *********************************************/
    // @vuese
    // Used to create a new
    createNew(){
      if(this.permission == true){
        if(this.titulo.length<=0 || this.resumen.length<=0 || this.texto.length<=0){
          alert("Por favor, rellene todos los campos para crear una noticia")
        }else{
          let date = getDate('/')
          this.autor = localStorage.getItem('USER_NAME')

          // Image name
          let array_cad = this.selectedFile.name.split(".")
          let date_extension = getDate('-')
          let folder_path = '/News/'+array_cad[0]+date_extension+'.'+array_cad[1]

          fb_functions.addNew(this.titulo, this.resumen, this.texto, this.autor, date, folder_path, this.selectedFile)

          this.snackbar = !this.snackbar;
          this.expand = false;
        }
      }
      else{
        this.snackbar_err = !this.snackbar_err;
      }
    },

    /**********************************************
     *
     * News created by the current user
     *
     *********************************************/
    // @vuese
    // Used to go to the user's news page
    showMyNews(){
      if(this.permission == true){  // Go to user news
        this.$router.push('/my-news')
      }
      else {                          // User does not have permission
        this.snackbar_err = !this.snackbar_err;
      }
    },

    /**********************************************
     *
     * Show new details
     *
     *********************************************/
    // @vuese
    // Used to go to the details new page
    // @arg The argument is a string value representing the new identifier
    showDetails(id) {
      this.$router.push({path: '/news/new-details/' + id, params: {id : this.id}})
    },
  }
}
</script>

<style scoped>
.news{
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

#news_container{
  margin: 20px 0;
  width: 90%;
  background-color: #fff;
  display: inline-block;
}

.notice_container{
  background-color: #f5f5f5;
  text-align: left;
  margin: 3% 3% !important;
  color: black;
  border-bottom: 3px solid #D50000;
  padding: 0;
}

.notice_container:hover{
  cursor: pointer;
  border-bottom: 3px solid #2c3e50;
  background-color: #ddddff;
}

img{
  width: 100%;
  object-fit: cover;
}

[class*="col"] {
  float: left;
}
#container_create{
  width: 90%;
  margin: 5%;
  border-radius: 12px;
}

#buttonsCreate_container{
  margin-top: 5%;
  margin-bottom: 5%;
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
.body-1, .body-2 {
  font-family: "F1 Regular" !important;
}
</style>