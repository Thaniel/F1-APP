<template>
  <div class="login">
    <v-snackbar v-model="snackbar" top :multi-line=true color="error"> El e-mail y contraseña no son correctos.
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <v-container class="img_container">
      <img src="../../assets/f1_red.png" alt="F1 logo" class="avatar">
    </v-container>

    <h1 class="h2 text-uppercase font-weight-bold">Welcome motor fanatic</h1>

    <v-form v-model="valid" id="form_login">
      <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
      <v-text-field v-model="psw" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]"
          :type="show1 ? 'text' : 'password'" name="input-10-1" label="Contraseña" @click:append="show1 = !show1" autocomplete
      ></v-text-field>
    </v-form>

    <div id="textPsw">
      <router-link to="/forgot-password">
        Recuperar contraseña
      </router-link>
    </div>
    <v-btn class="button h6" elevation="4" rounded :disabled="!valid" @click="login(email , psw)">Iniciar sesión</v-btn><br>
    <hr><br>
    <p>Si todavía no tienes una cuenta.</p>
    <v-btn class="button h6" elevation="4" rounded id="registerButton" @click="openRegister">Registrarme</v-btn><br>
  </div>
</template>

<script>
import firebase from "firebase/app";

export default {
  name: "Login-view",
  data(){
    return{
      valid: false,
      email: '',
      emailRules: [
        v => !!v || 'Introduzca su E-mail',
        v => /.+@.+/.test(v) || 'E-mail no valido',
      ],
      show1: false,
      psw: '',
      snackbar: false,
      rules: {
        required: value => !!value || 'Introduzca su contraseña.',
        min: v => v.length >= 6 || 'Mínimo 6 caracteres',
        emailMatch: () => ('El E-mail y la contraseña no coinciden '),
      },
    };
  },
  created() {
    window.scrollTo(0,0)
  },
  methods:{
    /**********************************************
     *
     * Login a user in the system
     *
     *********************************************/
    // @vuese
    // Used to log into the system
    // @arg The arguments are two strings value representing email and password
    login(email, psw){
      firebase.auth().signInWithEmailAndPassword(email, psw).then(() => {
        // Signed in
        this.$router.replace('/home')
      }).catch(() => {
        this.snackbar = !this.snackbar
        this.psw = ''
      });
    },

    /**********************************************
     *
     * Redirect to sign up page
     *
     *********************************************/
    // @vuese
    // Used to go to the registration page
    openRegister(){
      this.$router.replace('/sign-up')
    }
  }
}
</script>

<style scoped>

.login {
  margin: 0% 5%;
  padding: 15px;
  border-radius: 12px;
  background-color: white;
}

img{
  width: 30%;
}
#form_login{
  margin-left: 10%;
  margin-right: 10%;
}

.button{
  color: white !important;
  display: block;
  margin-top: 10px;
  margin-left: auto;
  margin-right: auto;
  min-width: 150px !important;
  background-color: #D50000 !important;
}

#registerButton{
  margin-top: 20px !important;
  background-color: #212121 !important;
}

button:hover {
  opacity: 0.8;
  cursor: pointer;
}

h1{
  padding: 4%;
}

#textPsw{
  margin-bottom: 5%;
  cursor: pointer;
  text-align: left;
  display: inline-block;
  text-decoration: underline;
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