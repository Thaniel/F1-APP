import firebase from "firebase/app";
import {getDate} from "../store/common";
import settings from "./settings";
import 'firebase/storage';
import 'firebase/database';
import 'firebase/auth'

// Initialize Firebase
firebase.initializeApp(settings);
const db = firebase.firestore();

export let user_permission = '';

/**********************************************
 *
 * Home
 *
 *********************************************/
/**
 * Gets the username and permission from the current user */
export function getAuthentication () {
    let user = firebase.auth().currentUser

    if(user !== null){
        db.collection('usuarios').where('email', '==', user.email).get().then((querySnapshot) =>{
            querySnapshot.forEach((doc) => {
                localStorage.setItem('USER_NAME', doc.data().usuario)
                user_permission = doc.data().admin
            })
        }).catch((error) => {
            console.log("Error getting documents: ", error)
        })
    }
}

export function getImageCircuit (date){
    let image = {url_image: ''}

    db.collection("calendario").where("fecha", "==", date).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            image.url_image = doc.data().foto_gp
        })
    }).catch((error) => {
        console.log("Error getting documents: ", error)
    })

    return image
}

/**********************************************
 *
 * News
 *
 *********************************************/
/**
 * Get all the news
 * @return {Array} List of all news
 * */
export function getNews () {
    let list = []

    db.collection('noticias').orderBy('fecha','desc').onSnapshot(res => {
        const changes = res.docChanges();

        changes.forEach(change => {
            /*
             * NEW ADDED
             */
            if (change.type === "added") {
                if(getDate('/') == change.doc.data().fecha){
                    list.unshift({
                        ...change.doc.data(),
                        id: change.doc.id
                    })
                }else{
                    list.push({
                        ...change.doc.data(),
                        id: change.doc.id
                    })
                }
            }
            /*
             * NEW MODIFIED
             */
            if (change.type === "modified") {
                let index = list.findIndex(function(n) {
                    if(n.id == change.doc.id)
                        return true;
                })
                if(index > -1){
                    list.splice(index, 1, {...change.doc.data(), id: change.doc.id})
                }else{
                    console.error("Error!!! Array index out of bounds")
                }
            }
            /*
             * NEW REMOVED
             */
            if (change.type === "removed") {
                let index = list.findIndex(function(n) {
                    if(n.id == change.doc.id)
                        return true;
                })
                if(index > -1){
                    list.splice(index, 1)
                }else{
                    console.error("Error!!! Array index out of bounds")
                }
            }
        })
    })

    return list
}

/**
 * Create a new
 * @param {string} title - The title of the new.
 * @param {string} resume - The resume of the new.
 * @param {string} text - The information of the new.
 * @param {string} author - The author of the new.
 * @param {string} date - The date of the new.
 * @param {string} path - The path of the new image.
 * @param {image} file - The image of the new.
 * */
export function addNew (title, resume, text, author, date, path, file) {
    // Add a new document with a generated id
    let my_new =  db.collection("noticias").doc()
    my_new.set({
        url_foto: '',
        titulo: title,
        resumen: resume,
        texto: text,
        autor: author,
        fecha: date,
    });

    // Add a new image to firebase store
    const storageRef = firebase.storage().ref(path)
    let uploadTask = storageRef.put(file)

    uploadTask.on('state_changed', function(snapshot){
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING:
                console.log('Upload is running');
                break;
        }
    }, function(error) {
        console.log(error);
    }, function() {
        // get the uploaded image url back
        uploadTask.snapshot.ref.getDownloadURL().then(
            function(downloadURL) {
                //console.log( downloadURL )
                my_new.update({
                    url_foto: downloadURL,
                })
            })
    })
}

/**
 * Get a new
 * @param {string} id - The identifier of the new.
 * @return {object} New
 * */
export function getNew (id) {
    let n = {titulo: '', autor: '', fecha: '', texto : '', url_foto: ''}

    db.collection("noticias").doc(id).get().then((doc) => {
        if (doc.exists) {
            n.titulo = doc.data().titulo
            n.autor = doc.data().autor
            n.fecha = doc.data().fecha
            n.texto = doc.data().texto
            n.url_foto = doc.data().url_foto
        } else {
        // doc.data() will be undefined in this case
            n.titulo = "Noticia no encontrada"
            n.autor = n.fecha = n.texto = n.url_foto = "null"
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

    return n
}

/**
 * Get all the comments of a new
 * @param {string} id - The identifier of the new.
 * @return {Array} List of all comments
 * */
export function getCommentsOfANew (id) {
    let list = []

    db.collection("noticias").doc(id).collection("comentarios").orderBy('fecha', 'desc').onSnapshot(res => {
        const changes = res.docChanges();
        changes.forEach(change => {
            /*
             * COMMENT ADDED
             */
            if (change.type === "added") {
                if (getDate('/') == change.doc.data().fecha) {
                    list.unshift({
                        ...change.doc.data(),
                        id: change.doc.id,
                        flag_edit: false,
                    })
                } else {
                    list.push({
                        ...change.doc.data(),
                        id: change.doc.id,
                        flag_edit: false,
                    })
                }
            }
            /*
             * COMMENT MODIFIED
             */
            if (change.type === "modified") {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1, {...change.doc.data(), id: change.doc.id, flag_edit: false,})
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
            /*
             * COMMENT REMOVED
             */
            if (change.type === "removed") {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1)
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
        })
    })
    return list
}

/**
 * Create a comment on a new
 * @param {string} id - The identifier of the new.
 * @param {string} user - The author of the comment.
 * @param {string} text - The text of the comment.
 * @param {string} date - The date of the comment.
 * */
export function addCommentToNew (id, user, text, date) {

    // Add a new document with a generated id
    let new_comm =  db.collection("noticias").doc(id).collection("comentarios").doc();
    new_comm.set({
        texto: text,
        autor: user,
        fecha: date
    })
}

/**
 * Edit a comment on a new
 * @param {string} id_n - The identifier of the new.
 * @param {string} id_c - The identifier of the comment.
 * @param {string} text - The text of the comment.
 * */
export function editCommentToNew (id_n, id_c, text) {

    db.collection("noticias").doc(id_n).collection("comentarios").doc(id_c).update({
        texto: text
    }).then(() => {
    }).catch((error) => {
        console.error("Error al editar el comentario: " + id_c + ". " + error)
    });

}

/**
 * Delete a comment on a new
 * @param {string} id_n - The identifier of the new.
 * @param {string} id_c - The identifier of the comment.
 * */
export function deleteCommentToNew (id_n, id_c) {

    db.collection("noticias").doc(id_n).collection("comentarios").doc(id_c).delete().then(() =>{
    }).catch((error) => {
        console.error("Error al eliminar el comentario: " + id_c + ". " + error);
    })

}

/**
 * Delete a new
 * @param {string} id_n - The identifier of the new.
 * */
export function deleteNew (id_n) {
    const storage = firebase.storage();

    // Delete all the comments
    db.collection('noticias').doc(id_n).collection("comentarios").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            doc.ref.delete()
        })
    })

    // Delete photo
    db.collection('noticias').doc(id_n).get().then((doc) => {
        if (doc.exists) {
            let imageRef = storage.refFromURL(doc.data().url_foto)
            imageRef.delete().catch((err) => {
                console.log(err);
            });

            // Delete new
            db.collection('noticias').doc(id_n).delete().then(() => {
                //alert("Noticia eliminada correctamente, por favor recargue la página");
            }).catch((error) => {
                console.error("Error al eliminar la noticia: " + id_n + ". " + error);
            });
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    })
}

/**
 * Edit a new
 * @param {string} id_n - The identifier of the new.
 * @param {string} title - The title of the new.
 * @param {string} resume - The resume of the new.
 * @param {string} text - The text of the new.
 * @param {string} author - The author of the new.
 * @param {string} date - The date the new.
 * @param {string} url_photo - The url of the new image.
 * */
export function editNew (id_n, title, resume, text, author, date, url_photo) {

    db.collection("noticias").doc(id_n).update({
        titulo: title,
        resumen: resume,
        texto: text,
        autor: author,
        fecha: date,
        url_foto:  url_photo
    }).then(() => {
        //alert("La noticia fue actualizada");
    }).catch((error) => {
        console.error("Error writing document: ", error);
    });
}


/**********************************************
 *
 * Schedule
 *
 *********************************************/
/**
 * Get all Grand Prix
 * @return {Array} List of all Grand Prix
 * */
export function getSchedule () {
    let list = []

    db.collection('calendario').orderBy('fecha','asc').onSnapshot(res => {
        const changes = res.docChanges();

        changes.forEach(change => {
            /*
             * GP ADDED
             */
            if (change.type === "added") {
                list.push({
                    ...change.doc.data(),
                    id: change.doc.id
                })
            }
            /*
             * GP MODIFIED
             */
            if (change.type === "modified") {
                let index = list.findIndex(function(n) {
                    if(n.id == change.doc.id)
                        return true;
                })
                if(index > -1){
                    list.splice(index, 1, {...change.doc.data(), id: change.doc.id})
                }else{
                    console.error("Error!!! Array index out of bounds")
                }
            }
            /*
             * GP REMOVED
             */
            if (change.type === "removed") {
                let index = list.findIndex(function(n) {
                    if(n.id == change.doc.id)
                        return true;
                })
                if(index > -1){
                    list.splice(index, 1)
                }else{
                    console.error("Error!!! Array index out of bounds")
                }
            }
        })
    })

    return list
}

/**
 * Get a circuit
 * @param {string} id - The identifier of the Grand Prix.
 * @return {object} Circuit
 * */
export function getCircuit (id) {
    let c = {gran_premio: '', pais: '', circuito: '', descripcion : '', fecha: '', foto_gp: '', horario_carrera: '',
        horario_clasi: '', aparicion_c: '', carrera_dist_c : '', vueltas_c: '', record_c: '', tamanno_c: ''}

    db.collection("calendario").doc(id).get().then((doc) => {
        if (doc.exists) {
            c.gran_premio = doc.data().gran_premio
            c.pais = doc.data().pais
            c.circuito = doc.data().circuito
            c.descripcion = doc.data().descripcion
            c.fecha = doc.data().fecha
            c.foto_gp = doc.data().foto_gp
            c.horario_carrera = doc.data().horario_carrera
            c.horario_clasi = doc.data().horario_clasi
            c.aparicion_c = doc.data().aparicion_c
            c.carrera_dist_c = doc.data().carrera_dist_c
            c.vueltas_c = doc.data().vueltas_c
            c.record_c = doc.data().record_c
            c.tamanno_c = doc.data().tamanno_c
        }else {
            // doc.data() will be undefined in this case
            c.gran_premio = "Gran Premio no encontrado"
            c.circuito = c.descripcion = c.fecha = c.foto_gp = c.horario_carrera = c.horario_clasi = c.aparicion_c = c.carrera_dist_c = c.vueltas_c = c.record_c = c.tamanno_c = "null"
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

    return c
}

/**
 * Create a Gran Prix
 * @param {string} gp - The name of the Gran Prix.
 * @param {string} circuit - The name of the circuit.
 * @param {string} country - The name of the country.
 * @param {string} date - The date of the Grand Prix.
 * @param {string} clasi_time - The classification schedule of the Grand Prix.
 * @param {string} race_time - The race schedule of the Grand Prix.
 * @param {string} c_appearance - The first appearance of the circuit.
 * @param {string} c_size - The size of the circuit.
 * @param {string} c_record - The record of the circuit.
 * @param {number} c_lap - The laps of the circuit.
 * @param {string} c_distance - The total distance of the race.
 * @param {string} description - The description of the Grand Prix.
 * @param {string} path - The path of the circuit image.
 * @param {image} file - The image of the circuit.
 * */
export function addGrandPrix (gp, circuit, country, date, clasi_time, race_time, c_appearance, c_size, c_record, c_lap, c_distance, description, path, file) {

    // Add a new document with a generated id
    let my_gp = db.collection("calendario").doc()
    my_gp.set({
        gran_premio: gp,
        circuito: circuit,
        pais: country,
        fecha: date,
        horario_clasi: clasi_time,
        horario_carrera: race_time,
        aparicion_c: c_appearance,
        tamanno_c: c_size,
        record_c: c_record,
        vueltas_c: c_lap,
        carrera_dist_c: c_distance,
        descripcion: description,
        foto_gp: '',
    });

    // Add a new image to firebase store
    const storageRef = firebase.storage().ref(path)
    let uploadTask = storageRef.put(file)

    uploadTask.on('state_changed', function (snapshot) {
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING:
                console.log('Upload is running');
                break;
        }
    }, function (error) {
        console.log(error);
    }, function () {
        // get the uploaded image url back
        uploadTask.snapshot.ref.getDownloadURL().then(
            function (downloadURL) {
                //console.log( downloadURL )
                my_gp.update({
                    foto_gp: downloadURL,
                })
            })
    })
}

/**
 * Edit a Gran Prix
 * @param {string} gp_id - The identifier of the Gran Prix.
 * @param {string} gp - The name of the Gran Prix.
 * @param {string} circuit - The name of the circuit.
 * @param {string} country - The name of the country.
 * @param {string} date - The date of the Grand Prix.
 * @param {string} clasi_time - The classification schedule of the Grand Prix.
 * @param {string} race_time - The race schedule of the Grand Prix.
 * @param {string} c_appearance - The first appearance of the circuit.
 * @param {string} c_size - The size of the circuit.
 * @param {string} c_record - The record of the circuit.
 * @param {number} c_lap - The laps of the circuit.
 * @param {string} c_distance - The total distance of the race.
 * @param {string} description - The description of the Grand Prix.
 * @param {image} url_photo - The image of the circuit.
 * */
export function editGrandPrix (gp_id, gp, circuit, country, date, clasi_time, race_time, c_appearance, c_size, c_record, c_lap, c_distance, description, url_photo) {

    db.collection("calendario").doc(gp_id).update({
        gran_premio: gp,
        circuito: circuit,
        pais: country,
        fecha: date,
        horario_clasi: clasi_time,
        horario_carrera: race_time,
        aparicion_c: c_appearance,
        tamanno_c: c_size,
        record_c: c_record,
        vueltas_c: c_lap,
        carrera_dist_c: c_distance,
        descripcion: description,
        foto_gp: url_photo,
    }).then(() => {
        // Updated
    }).catch((error) => {
        console.error("Error writing document: ", error);
    });
}

/**
 * Delete a Gran Prix
 * @param {string} gp_id - The identifier of the Gran Prix.
 * */
export function deleteGrandPrix (gp_id) {
    const storage = firebase.storage();

    // Delete photo
    db.collection('calendario').doc(gp_id).get().then((doc) => {
        if (doc.exists) {
            let imageRef = storage.refFromURL(doc.data().foto_gp)
            imageRef.delete().catch((err) => {
                console.log(err);
            });

            // Delete new
            db.collection('calendario').doc(gp_id).delete().then(() => {
                // Deleted
            }).catch((error) => {
                console.error("Error al eliminar el Gran Premio: " + gp_id + ". " + error);
            });
        } else {
            // doc.data() will be undefined in this case
            console.error("No such document!");
        }
    }).catch((error) => {
        console.error("Error getting document:", error);
    });
}


/**********************************************
 *
 * Teams
 *
 *********************************************/
/**
 * Get all teams
 * @return {Array} List of all teams
 * */
export function getTeams () {
    let list = []

    db.collection('escuderias').orderBy('puntos','desc').onSnapshot(res => {
        const changes = res.docChanges();

        changes.forEach(change => {
            /*
             * TEAM ADDED
             */
            if (change.type === "added") {
                list.push({
                    ...change.doc.data(),
                    id: change.doc.id
                })
            }
            /*
             * TEAM MODIFIED
             */
            if (change.type === "modified") {
                let index = list.findIndex(function(n) {
                    if(n.id == change.doc.id)
                        return true;
                })
                if(index > -1){
                    list.splice(index, 1, {...change.doc.data(), id: change.doc.id})
                }else{
                    console.error("Error!!! Array index out of bounds")
                }
            }
            /*
             * TEAM REMOVED
             */
            if (change.type === "removed") {
                let index = list.findIndex(function(n) {
                    if(n.id == change.doc.id)
                        return true;
                })
                if(index > -1){
                    list.splice(index, 1)
                }else{
                    console.error("Error!!! Array index out of bounds")
                }
            }
        })
    })

    return list
}

/**
 * Get a team
 * @param {string} id - The identifier of the team.
 * @return {object} Team
 * */
export function getTeam (id) {
    let t = {nombre: '', nombre_completo: '', jefe_equipo: '', mundiales_constructores : '', puntos: '', codigo : '',
        url_logo: '', url_coche: '', descripcion: '', url_piloto_1: '', piloto_1: '', url_piloto_2: '', piloto_2: ''}

    db.collection("escuderias").doc(id).get().then((doc) => {
        if (doc.exists) {
            t.nombre = doc.data().nombre
            t.nombre_completo = doc.data().nombre_completo
            t.jefe_equipo = doc.data().jefe_equipo
            t.mundiales_constructores = doc.data().mundiales_constructores
            t.puntos = doc.data().puntos
            t.codigo = doc.data().codigo
            t.url_logo = doc.data().logo
            t.url_coche = doc.data().foto_coche
            t.descripcion = doc.data().descripcion

            // Get driver 1
            db.doc(doc.data().ref_piloto1.path).get().then((doc2) =>{
                if (doc2.exists) {
                    t.url_piloto_1 = doc2.data().foto_piloto
                    t.piloto_1 = doc2.data().nombre + " " + doc2.data().apellidos
                }else {
                    t.piloto_1 = "Piloto no encontrado"
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });

            // Get driver 2
            db.doc(doc.data().ref_piloto2.path).get().then((doc3) =>{
                if (doc3.exists) {
                    t.url_piloto_2 = doc3.data().foto_piloto
                    t.piloto_2 = doc3.data().nombre + " " + doc3.data().apellidos
                }else {
                    t.piloto_2 = "Piloto no encontrado"
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
        } else {
            // doc.data() will be undefined in this case
            t.nombre = "Escudería no encontrada"
            t.nombre_completo = t.jefe_equipo = t.mundiales_constructores = t.puntos = t.codigo = t.url_logo = t.url_coche = t.descripcion = "null"
            t.url_piloto_1 = t.url_piloto_2 = t.piloto_1 = t.piloto_2 = "null"
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

    return t
}

/**
 * Get the name and identifier of all drivers
 * @return {Array} Drivers
 * */
export function getDriversNameId () {
    let list = []

    db.collection("pilotos").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let p = {nombre_p: '', apellidos_p: '', id: ''}
            p.id = doc.id
            p.nombre_p = doc.data().nombre
            p.apellidos_p = doc.data().apellidos
            list.push(p)
        })
    })

    return list
}

/**
 * Create a team
 * @param {string} name - The name of the team.
 * @param {string} full_name - The full name of the team.
 * @param {string} team_principal - The team principal of the team.
 * @param {number} champions - The titles of the team.
 * @param {number} points - The points of the team.
 * @param {string} identifier - The identifier code of the team.
 * @param {image} car_photo - The car image of the team.
 * @param {image} logo - The logo of the team.
 * @param {string} id_piloto_1 - The team's driver 1 identifier.
 * @param {string} id_piloto_2 - The team's driver 2 identifier.
 * @param {string} description - The description of the team.
 * @param {string} path_1 - The path of the car image.
 * @param {string} path_2 - The path of the logo image.
 * */
export function addTeam (name, full_name, team_principal, champions, points, identifier, car_photo, logo, id_piloto_1, id_piloto_2, description, path_1, path_2) {

   // console.log(name + " " + full_name  + " " +  team_principal + " " +  champions + " " +  points + " " +  colour + " " +
     //   car_photo + " " +  logo + " " +  id_piloto_1 + " " +  id_piloto_2 + " " +  description + " " +  folder_path_1 + " " +  folder_path_2)
    // Add a new document with a generated id

    let my_team = db.collection("escuderias").doc()
    my_team.set({
        nombre: name,
        nombre_completo: full_name,
        jefe_equipo: team_principal,
        mundiales_constructores: Number(champions),
        puntos: Number(points),
        codigo: identifier,
        ref_piloto1: db.doc('/pilotos/' + id_piloto_1),
        ref_piloto2: db.doc('/pilotos/' + id_piloto_2),
        descripcion: description,
        });

    // Add a new image to firebase store
    const storageRef = firebase.storage().ref(path_1)
    let uploadTask = storageRef.put(car_photo)

    uploadTask.on('state_changed', function (snapshot) {
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED:
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING:
          console.log('Upload is running');
          break;
      }
    }, function (error) {
      console.log(error);
    }, function () {
      // get the uploaded image url back
      uploadTask.snapshot.ref.getDownloadURL().then(
          function (downloadURL) {
            //console.log( downloadURL )
            my_team.update({
              foto_coche: downloadURL,
            })
          })
    })

    // Add a new image to firebase store
    const storageRef_2 = firebase.storage().ref(path_2)
    let uploadTask_2 = storageRef_2.put(logo)

    uploadTask_2.on('state_changed', function (snapshot) {
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING:
                console.log('Upload is running');
                break;
        }
    }, function (error) {
        console.log(error);
    }, function () {
        // get the uploaded image url back
        uploadTask_2.snapshot.ref.getDownloadURL().then(
            function (downloadURL) {
                //console.log( downloadURL )
                my_team.update({
                    logo: downloadURL,
                })
            })
    })
}

export function getSurnameOfTeamDrivers (doc_path, doc_path2) {
    let driver = []

    db.doc(doc_path).get().then((doc) => {
        driver.push(doc.data().apellidos)
    }).catch((error) => {
        console.log("Error getting cached document:", error);
    });
    db.doc(doc_path2).get().then((doc) => {
        driver.push(doc.data().apellidos)
    }).catch((error) => {
        console.log("Error getting cached document:", error);
    });


    return driver
}

/**
 * Edit a team
 * @param {string} team_id - The identifier of the team.
 * @param {string} name - The name of the team.
 * @param {string} full_name - The full name of the team.
 * @param {string} team_principal - The team principal of the team.
 * @param {number} champions - The titles of the team.
 * @param {number} points - The points of the team.
 * @param {string} identifier - The identifier code of the team.
 * @param {string} id_piloto_1 - The team's driver 1 identifier.
 * @param {string} id_piloto_2 - The team's driver 2 identifier.
 * @param {string} description - The description of the team.
 * */
export function editTeam (team_id, name, full_name, team_principal, champions, points, identifier, id_piloto_1, id_piloto_2, description) {
    db.collection("escuderias").doc(team_id).update({
        nombre: name,
        nombre_completo: full_name,
        jefe_equipo: team_principal,
        mundiales_constructores: Number(champions),
        puntos:  Number(points),
        codigo: identifier,
        ref_piloto1: db.doc('/pilotos/' + id_piloto_1),
        ref_piloto2: db.doc('/pilotos/' + id_piloto_2),
        descripcion: description,
    }).then(() => {
        // Edited
    }).catch((error) => {
        console.error("Error writing document: ", error);
    });
}

/**
 * Delete a team
 * @param {string} team_id - The identifier of the team.
 * */
export function deleteTeam (team_id) {

    const storage = firebase.storage();

    // Delete photo
    db.collection('escuderias').doc(team_id).get().then((doc) => {
        if (doc.exists) {
            let imageRef = storage.refFromURL(doc.data().foto_coche)
            imageRef.delete().catch((err) => {
                console.log(err);
            });
            // Delete photo
            db.collection('escuderias').doc(team_id).get().then((doc) => {
                if (doc.exists) {
                    let imageRef = storage.refFromURL(doc.data().logo)
                    imageRef.delete().catch((err) => {
                        console.log(err);
                    });

                    // Delete new
                    db.collection('escuderias').doc(team_id).delete().then(() => {
                        //alert("Noticia eliminada correctamente, por favor recargue la página");
                    }).catch((error) => {
                        console.error("Error al eliminar la escudería: " + team_id + ". " + error);
                    });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            })

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    })


}


/**********************************************
 *
 * Drivers
 *
 *********************************************/
/**
 * Get all drivers
 * @return {Array} List of all drivers
 * */
export function getDrivers () {
    let list = []

    db.collection('pilotos').orderBy("puntos", "desc").onSnapshot(res => {
        const changes = res.docChanges();

        changes.forEach(change => {
            /*
             * DRIVER ADDED
             */
            if (change.type === "added") {
                db.doc(change.doc.data().equipo.path).get().then((doc2) => {
                    if (doc2.exists) {
                        list.push({
                            ...change.doc.data(),
                            id: change.doc.id,
                            codigo: doc2.data().codigo
                        })
                    } else {
                        console.log("hi")
                        list.push({
                            ...change.doc.data(),
                            id: change.doc.id,
                            codigo: 'default'
                        })
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });
            }
            /*
             * DRIVER MODIFIED
             */
            if (change.type === "modified") {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1, {...change.doc.data(), id: change.doc.id})
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
            /*
             * DRIVER REMOVED
             */
            if (change.type === "removed") {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1)
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
        })
    })
    return list
}

/**
 * Get a driver
 * @param {string} id - The identifier of the driver.
 * @return {object} Driver
 * */
export function getDriver (id) {
    let d = {nombre: '', url_piloto: '', codigo: '', url_logo: '', pais: '', mundiales: '', puntos: ''}
    db.collection("pilotos").doc(id).get().then((doc) => {
        if (doc.exists) {
            d.nombre = doc.data().nombre + "  " + doc.data().apellidos
            d.url_piloto = doc.data().foto_piloto
            d.pais = doc.data().pais
            d.mundiales = doc.data().mundiales
            d.puntos = doc.data().puntos

            db.doc(doc.data().equipo.path).get().then((doc2) =>{
                if (doc2.exists) {
                    d.codigo = doc2.data().codigo
                    d.url_logo = doc2.data().logo
                }else{
                    d.codigo = "default"
                }
            }).catch((error) => {
                console.log("Error getting document:", error)
            });

        } else {
            d.nombre = "Piloto no encontrado"
            d.url_piloto = d.url_logo = d.pais = d.mundiales = d.codigo = "null"
        }
    }).catch((error) => {
        console.log("Error getting document:", error)
    });
    return d
}

/**
 * Get the name and identifier of all teams
 * @return {Array} Teams
 * */
export function getTeamNameId () {
    let list = []

    db.collection("escuderias").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let e = {nombre: '', id: ''}
            e.id = doc.id
            e.nombre = doc.data().nombre
            list.push(e)
        })
    })

    return list
}

/**
 * Create a dirver
 * @param {string} name - The name of the driver.
 * @param {string} surname - The surname of the driver.
 * @param {string} country - The country of the driver.
 * @param {number} titles - The titles of the driver.
 * @param {number} points - The points of the driver.
 * @param {string} id_team - The driver's team identifier.
 * @param {image} driver_photo - The driver image.
 * @param {image} logo - The logo of the driver.
 * @param {string} path_1 - The path of the driver image.
 * @param {string} path_2 - The path of the logo image.
 * */
export function addDriver (name, surname, country, titles, points, id_team, driver_photo, path_1) {

    // Add a new document with a generated id
    let my_driver = db.collection("pilotos").doc()
    my_driver.set({
        nombre: name,
        apellidos: surname,
        pais: country,
        mundiales: Number(titles),
        puntos: Number(points),
        equipo: db.doc('/escuderias/' + id_team),
    });

    // Add a new image to firebase store
    const storageRef = firebase.storage().ref(path_1)
    let uploadTask = storageRef.put(driver_photo)

    uploadTask.on('state_changed', function (snapshot) {
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING:
                console.log('Upload is running');
                break;
        }
    }, function (error) {
        console.log(error);
    }, function () {
        // get the uploaded image url back
        uploadTask.snapshot.ref.getDownloadURL().then(
            function (downloadURL) {
                //console.log( downloadURL )
                my_driver.update({
                    foto_piloto: downloadURL,
                })
            })
    })

    // Add a new image to firebase store
    /*
    const storageRef_2 = firebase.storage().ref(path_2)
    let uploadTask_2 = storageRef_2.put(logo)

    uploadTask_2.on('state_changed', function (snapshot) {
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING:
                console.log('Upload is running');
                break;
        }
    }, function (error) {
        console.log(error);
    }, function () {
        // get the uploaded image url back
        uploadTask_2.snapshot.ref.getDownloadURL().then(
            function (downloadURL) {
                //console.log( downloadURL )
                my_driver.update({
                    logo: downloadURL,
                })
            })
    })
    */
}

/**
 * Edit a dirver
 * @param {string} driver_id - The identifier of the driver.
 * @param {string} name - The name of the driver.
 * @param {string} name - The name of the driver.
 * @param {string} surname - The surname of the driver.
 * @param {string} country - The country of the driver.
 * @param {number} titles - The titles of the driver.
 * @param {number} points - The points of the driver.
 * @param {string} id_team - The driver's team identifier.
 * */
export function editDriver (driver_id, name, surname, country, titles, points, id_team) {

    db.collection("pilotos").doc(driver_id).update({
        nombre: name,
        apellidos: surname,
        pais: country,
        mundiales: Number(titles),
        puntos:  Number(points),
        equipo: db.doc('/escuderias/' + id_team),
    }).then(() => {
        // Edited
    }).catch((error) => {
        console.error("Error writing document: ", error);
    });
}

/**
 * Delete a dirver
 * @param {string} driver_id - The identifier of the driver.
 * */
export function deleteDriver (driver_id) {

    const storage = firebase.storage();

    // Delete photo
    db.collection('pilotos').doc(driver_id).get().then((doc) => {
        if (doc.exists) {
            let imageRef = storage.refFromURL(doc.data().foto_piloto)
            imageRef.delete().catch((err) => {
                console.log(err);
            });

            // Delete driver
            db.collection('pilotos').doc(driver_id).delete().then(() => {
                //alert("Noticia eliminada correctamente, por favor recargue la página");
            }).catch((error) => {
                console.error("Error al eliminar el piloto: " + driver_id + ". " + error);
            });
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    })


}


/**********************************************
 *
 * Forum
 *
 *********************************************/
/**
 * Get all themes
 * @return {Array} List of all themes
 * */
export function getThemes () {
    let list = []

    db.collection('temas').orderBy('fecha','desc').onSnapshot(res => {
        const changes = res.docChanges();

        changes.forEach(change => {
            /*
             * THEME ADDED
             */
            if (change.type === "added") {
                if(getDate('/') == change.doc.data().fecha){
                    list.unshift({
                        ...change.doc.data(),
                        id: change.doc.id
                    })
                }else{
                    list.push({
                        ...change.doc.data(),
                        id: change.doc.id
                    })
                }
            }
            /*
              * THEME MODIFIED
              */
            if (change.type === "modified") {
                let index = list.findIndex(function(n) {
                    if(n.id == change.doc.id)
                        return true;
                })
                if(index > -1){
                    list.splice(index, 1, {...change.doc.data(), id: change.doc.id})
                }else{
                    console.error("Error!!! Array index out of bounds")
                }
            }
            /*
             * THEME REMOVED
             */
            if (change.type === "removed") {
                let index = list.findIndex(function(n) {
                    if(n.id == change.doc.id)
                        return true;
                })
                if(index > -1){
                    list.splice(index, 1)
                }else{
                    console.error("Error!!! Array index out of bounds")
                }
            }
        })
    })

    return list
}

/**
 * Get all themes from a user
 * @param {string} user - The name of the current user.
 * @return {Array} List of all themes from a user
 * */
export function getUserThemes (user) {
    let list = []

    db.collection('temas').orderBy('fecha', 'desc').onSnapshot(res => {
        const changes = res.docChanges();

        changes.forEach(change => {
            /*
             * THEME ADDED
             */
            if (change.type === "added" && change.doc.data().autor == user) {
                if (getDate('/') == change.doc.data().fecha) {
                    list.unshift({
                        ...change.doc.data(),
                        id: change.doc.id
                    })
                } else {
                    list.push({
                        ...change.doc.data(),
                        id: change.doc.id
                    })
                }
            }
            /*
             * THEME MODIFIED
             */
            if (change.type === "modified" && change.doc.data().autor == user) {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1, {...change.doc.data(), id: change.doc.id})
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
            /*
             * THEME REMOVED
             */
            if (change.type === "removed" && change.doc.data().autor == user) {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1)
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
        })
    })

    return list
}

/**
 * Create a theme
 * @param {string} title - The title of the theme.
 * @param {string} user - The author of the theme.
 * @param {string} date - The date of the theme.
 * @param {string} comment - The text of the firts comment.
 * */
export function addTheme (title, user, date, comment) {
    // Add a new document with a generated id
    let new_theme = db.collection("temas").doc()
    new_theme.set({
        titulo: title,
        autor: user,
        fecha: date,
        n_comentarios: 1,
    })

    // Add first comment into the sub-collection
    let new_comment = new_theme.collection("comentarios").doc()
    new_comment.set({
        texto: comment,
        autor: user,
        fecha: date,
    })
}

/**
 * Edit a theme
 * @param {string} theme_id - The identifier of the theme.
 * @param {string} title - The title of the theme.
 * */
export function editTheme (theme_id, title) {
    db.collection("temas").doc(theme_id).update({
        titulo: title,
    }).then(() => {
        //alert("La noticia fue actualizada");
    }).catch((error) => {
        console.error("Error writing document: ", error);
    });
}

/**
 * Delete a theme
 * @param {string} theme_id - The identifier of the theme.
 * */
export function deleteTheme (theme_id) {
    // Delete all the comments
    db.collection('temas').doc(theme_id).collection("comentarios").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            doc.ref.delete()
        })
    })

    // Delete theme selected
    db.collection('temas').doc(theme_id).delete().then(() => {
        // Deleted
    }).catch((error) => {
        console.error("Error al eliminar el tema: " + theme_id + ". " + error)
    })
}

/**
 * Get all comments on a theme
 * @param {string} theme_id - The identifier of the theme
 * @return {Array} List of all comments
 * */
export function getComments (theme_id) {
    let list = []

    db.collection("temas").doc(theme_id).collection("comentarios").orderBy('fecha', 'desc').onSnapshot(res => {
        const changes = res.docChanges();
        changes.forEach(change => {
            /*
             * COMMENT ADDED
             */
            if (change.type === "added") {
                if (getDate('/') == change.doc.data().fecha) {
                    list.unshift({
                        ...change.doc.data(),
                        id: change.doc.id,
                        flag_edit: false,
                    })
                } else {
                    list.push({
                        ...change.doc.data(),
                        id: change.doc.id,
                        flag_edit: false,
                    })
                }
            }
            /*
             * COMMENT MODIFIED
             */
            if (change.type === "modified") {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1, {...change.doc.data(), id: change.doc.id, flag_edit: false,})
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
            /*
             * COMMENT REMOVED
             */
            if (change.type === "removed") {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1)
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
        })
    })

    return list
}

/**
 * Create a comment on a theme
 * @param {string} theme_id The identifier of the theme.
 * @param {string} user - The author of the comment.
 * @param {string} text - The text of the comment.
 * @param {string} date - The date of the comment.
 * */
export function addCommentToTheme (theme_id, user, text, date) {

    // Add a new document with a generated id
    let new_comment =  db.collection("temas").doc(theme_id).collection("comentarios").doc();
    new_comment.set({
        texto: text,
        autor: user,
        fecha: date
    })

    // Increment the number of comments by 1
    db.collection('temas').doc(theme_id).update({
        n_comentarios: firebase.firestore.FieldValue.increment(1)
    })
}

/**
 * Edit a comment on a theme
 * @param {string} theme_id - The identifier of the theme
 * @param {string} id_c - The identifier of the comment.
 * @param {string} text - The text of the comment.
 * */
export function editCommentToTheme (theme_id, id_c, text) {
    db.collection("temas").doc(theme_id).collection("comentarios").doc(id_c).update({
        texto: text
    }).then(() => {
        // Edited
    }).catch((error) => {
        console.error("Error al editar el comentario: " + id_c + ". " + error)
    })
}

/**
 * Delete a comment on a theme
 * @param {string} theme_id - The identifier of the theme.
 * @param {string} id_c - The identifier of the comment.
 * */
export function deleteCommentToTheme (theme_id, id_c) {
    db.collection("temas").doc(theme_id).collection("comentarios").doc(id_c).delete().then(() =>{
        // Deleted
    }).catch((error) => {
        console.error("Error al eliminar el comentario: " + id_c + ". " + error);
    })

    // Decrement the number of comments by 1
    db.collection('temas').doc(theme_id).update({
        n_comentarios: firebase.firestore.FieldValue.increment(-1)
    })
}


/**********************************************
 *
 * Vote
 *
 *********************************************/
/**
 * Get all votings
 * @return {Array} List of all votings
 * */
export function getAllVotes () {
    let list = []

    db.collection('votaciones').orderBy('fecha','desc').onSnapshot(res => {
        const changes = res.docChanges();
        changes.forEach(change => {
            /*
             * VOTE ADDED
             */
            if (change.type === "added") {
                if (getDate('/') == change.doc.data().fecha) {
                    list.unshift({
                        ...change.doc.data(),
                        id: change.doc.id,
                    })
                } else {
                    list.push({
                        ...change.doc.data(),
                        id: change.doc.id,
                    })
                }
            }
            /*
             * VOTE MODIFIED
             */
            if (change.type === "modified") {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1, {...change.doc.data(), id: change.doc.id})
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
            /*
             * VOTE REMOVED
             */
            if (change.type === "removed") {
                let index = list.findIndex(function (n) {
                    if (n.id == change.doc.id)
                        return true;
                })
                if (index > -1) {
                    list.splice(index, 1)
                } else {
                    console.error("Error!!! Array index out of bounds")
                }
            }
        })
    })

    return list

}

/**
 * Get the 3 most voted drivers of a voting
 * @param {array} paths - The paths of the drivers
 * @param {string} votes - The vote results of the drivers.
 * @return {Array} List of all themes
 * */
export function getPodium (paths, votes) {
    let list = []

    // Get the vote selected
    let i = 0
    while(i < 3){
        let d = {nombre: '', url_foto: '', porcentaje: 0}
        d.porcentaje = votes[i]
        db.doc(paths[i]).get().then((doc) =>{
            if (doc.exists) {
                d.nombre = doc.data().nombre + " " + doc.data().apellidos
                d.url_foto = doc.data().foto_piloto


                db.doc(doc.data().equipo.path).get().then((doc2) =>{
                    if (doc2.exists) {
                        d.codigo = doc2.data().codigo
                        list.push(d)
                    }else {
                        console.log("Escuderia no encontrada")
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error)
                });
            }else {
                console.log("Piloto no encontrado")
            }
        }).catch((error) => {
            console.log("Error getting document:", error)
        });

        i++
    }
    return list

}

/**
 * Create and activate a new vote
 * @param {string} name - The name of the vote
 * @param {string} date - The date of the vote
 * */
export function open_vote (name, date) {
    // Create Vote
    let new_vote = db.collection("votaciones").doc()
    new_vote.set({
        contador: Number(0),
        estado: "activa",
        fecha: date,
        nombre_gp: name,
    })

    // Create subcollection Votes
    db.collection("pilotos").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let new_driver = new_vote.collection("votos").doc(doc.id);
            new_driver.set({
                numero: Number(0)
            })
        })
    })
}

/**
 * Close the current active vote
 * @param {string} active_id - The identifier of the active vote
 * */
export function close_vote (active_id) {
    db.collection("votaciones").doc(active_id).update({
        estado: "finalizada"
    }).then(() => {
        let i = 0

        // Retrive total votes
        db.collection("votaciones").doc(active_id).get().then((doc) =>{
            if (doc.exists) {
                let total_votes = doc.data().contador
                if(total_votes > 0){
                    // Retrive the 3 most voted drivers
                    db.collection("votaciones").doc(active_id).collection("votos").orderBy('numero','desc').limit(3).get().then((querySnapshot) => {
                        querySnapshot.forEach((d) => {
                            if(i == 0){
                                let driver = d.id
                                let perc = d.data().numero * 100 / total_votes
                                db.collection("votaciones").doc(active_id).update({
                                    primero:[ db.doc('/pilotos/' + driver), perc.toFixed(2)]
                                })
                            }
                            if(i == 1){
                                let driver = d.id
                                let perc = d.data().numero * 100 / total_votes
                                db.collection("votaciones").doc(active_id).update({
                                    segundo:[ db.doc('/pilotos/' + driver), perc.toFixed(2)]
                                })
                            }
                            if(i == 2){
                                let driver = d.id
                                let perc = d.data().numero * 100 / total_votes
                                db.collection("votaciones").doc(active_id).update({
                                    tercero:[ db.doc('/pilotos/' + driver), perc.toFixed(2)]
                                })
                            }
                            i++
                        })
                    })
                }else {
                    console.error("Error al cerrar votacion: " + active_id + ". Division por 0 no permitida")
                }
            }
        }).catch((error) => {
            console.error("Error al cerrar votacion: " + active_id + ". " + error)
        })
    }).catch((error) => {
        console.error("Error al cerrar votacion: " + active_id + ". " + error)
    })
}


/**********************************************
 *
 * Table
 *
 *********************************************/

/**
 * Get team ranking
 * @return {Array} List of the team ranking
 * */
export function getTeamsRanking () {
    let list = []
    let iterator = 1

    db.collection("escuderias").orderBy("puntos", "desc").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let e = {nombre: '', puntos: '', codigo: '', id:  ''}
            e.nombre = iterator + "- " + doc.data().nombre
            e.codigo = doc.data().codigo
            e.puntos = doc.data().puntos
            e.id = doc.id
            list.push(e)
            iterator++
        })
    })

    return list
}

/**
 * Get driver ranking
 * @return {Array} List of the driver ranking
 * */
export function getDriversRanking () {
    let list = []
    let iterator = 1

    db.collection("pilotos").orderBy("puntos", "desc").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let p = {nombre: '', apellidos: '', puntos: '', codigo: '', id: ''}
            p.nombre = iterator + "- " + doc.data().nombre.substring(0,1)+"."
            p.apellidos = doc.data().apellidos
            p.puntos = doc.data().puntos
            p.id = doc.id
            list.push(p)

            db.doc(doc.data().equipo.path).get().then((doc2) =>{
                if (doc2.exists) {
                    p.codigo = doc2.data().codigo
                }else {
                    p.codigo = "default"
                    console.log("Escuderia no encontrada")
                }
            }).catch((error) => {
                console.log("Error getting document:", error)
            })
            iterator++
        })
    })

    return list
}

/**
 * Get the latest ranking update
 * @return {object} The latest ranking update
 * */
export function getLastUpdateRanking () {
    let list = []

    db.collection("info").doc("carreras").get().then((doc) =>{
        if (doc.exists) {
            list.push(doc.data().numero)
        }else {
            list.push(-1)
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

    return list
}

/**
 * Update team ranking
 * @param {array} teams_data - The data of team points
 */
export function updateTeamsRanking (teams_data) {
    let i = 0

    while (i < teams_data.length) {
        db.collection("escuderias").doc(teams_data[i].id).set({
            puntos: Number(teams_data[i].puntos)
        }, { merge: true });
        i++;
   }

}

/**
 * Update driver ranking
 * @param {array} drivers_data - The data of driver points
 */
export function updateDriversRanking (drivers_data) {
    let i = 0

    while (i < drivers_data.length) {
        db.collection("pilotos").doc(drivers_data[i].id).set({
            puntos: Number(drivers_data[i].puntos)
        }, { merge: true });
        i++;
    }
}

/**
 * Set the last ranking update
 */
export function setLastUpdateRanking (number_race) {
    db.collection("info").doc("carreras").update({
        numero: number_race
    }).then(() => {
        // Updated
    }).catch((error) => {
        console.error("Error writing document: ", error);
    });
}