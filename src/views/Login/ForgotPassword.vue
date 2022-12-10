<template>
  <div class="forgot-password">
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> {{ snackbar_text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="emailSendReturnLogin()" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbar_err" top :multi-line=true color="error"> {{ snackbar_err_text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar_err = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <v-container class="img_container">
      <img src="../../assets/f1_red.png" alt="F1 logo" class="avatar">
    </v-container>
    <h1 class="h1 text-uppercase font-weight-bold">RECUPERAR CONTRASEÑA</h1><br>
    <p>Por favor, introduzca su email para recuperar la contraseña.</p>
    <hr>
    <v-form v-model="valid" id="form_recover_psw">
      <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
    </v-form>
    <div id="buttons_container">
      <v-btn class="button body-2" id="cancelButton" elevation="4" rounded @click="goBack()">Cancelar</v-btn>
      <v-btn class="button body-2" elevation="4" rounded :disabled="!valid" @click="recoverPsw(email)">Enviar</v-btn>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";

export default {
  name: "ForgotPassword",
  data(){
    return{
      snackbar: false,
      snackbar_text: '',
      snackbar_err: '',
      snackbar_err_text: '',
      valid: false,
      email:'',
      emailRules: [
        v => !!v || 'Introduzca su E-mail',
        v => /.+@.+/.test(v) || 'E-mail no valido',
      ],
    };
  },
  created() {
    window.scrollTo(0,0)
  },
  methods:{
    /**********************************************
     *
     * Send an email to change the password
     *
     *********************************************/
    // @vuese
    // Used to reset the user's password
    recoverPsw(){
      if(this.email.length<=0){
        this.showSnackbar_err("Por favor, introduzca su E-mail");
      }
      else {
        firebase.auth().sendPasswordResetEmail(this.email).then(() => {
          // Password reset email sent!
          this.showSnackbar("Resvise su E-mail")
        }).catch(() => {
          this.showSnackbar_err("El E-mail no es correcto")
        });
      }
    },

    /**********************************************
     *
     * Go back to login
     *
     *********************************************/
    // @vuese
    // Used to go to the login page
    goBack(){
      this.$router.push("/login")
    },

    // @vuese
    // Used to go to the login page
    emailSendReturnLogin(){
      this.snackbar = false;
      this.$router.push("/login")
    },

    // @vuese
    // Used to show snackbar alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar(cad){
      this.snackbar_text = cad
      this.snackbar = !this.snackbar
    },

    // @vuese
    // Used to show snackbar error alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar_err(cad){
      this.snackbar_err_text = cad
      this.snackbar_err = !this.snackbar_err
    }

  }
}
</script>

<style scoped>

.forgot-password {
  margin: 0% 5%;
  padding: 30px;
  border-radius: 12px;
  background-color: white;
}

img{
  width: 30%;
}

#form_recover_psw{
  padding: 5%;
}

#buttons_container{
  display: inline-block;
  width: 100%;
  margin-top: 5%;
}

.button{
  color: white !important;
  border: none;
  display: block;
  width: 45%;
  background-color: #D50000 !important;
  float: left;
}

#cancelButton{
  background-color: #212121 !important;
  margin-right: 10%;
}

button:hover {
  opacity: 0.8;
  cursor: pointer;
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