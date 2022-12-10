export function getDate(delimiter){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0
    let yyyy = today.getFullYear();
    let h = today.getHours();
    let m = today.getMinutes();

    if (m>=0 && m<=9)
        m = "0"+m

    if(delimiter == '-'){
        today = yyyy + '-' + mm + '-' + dd;
        let time = h + '-' + m;
        return(today + '-' + time);
    }else{
        today = yyyy + '/' + mm + '/' + dd;
        let time = h + ':' + m;
        return(today + ' ' + time);
    }
}

export function getDateWithoutTime(delimiter){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0
    let yyyy = today.getFullYear();

    if(delimiter == '-'){
        today = yyyy + '-' + mm + '-' + dd;
        return(today);
    }else{
        today = yyyy + '/' + mm + '/' + dd;
        return(today );
    }
}

export function getDateRace(date, time){
    let day = ''

    const d = new Date(date.toString())
    let number_day = date.substring(8)
    let hour = 0;

    if (isItSummerTime(date.substring(5,7), date.substring(8,10))){
        hour = parseInt(time.substring(0,2)) + 2
    }else{
        hour = parseInt(time.substring(0,2)) + 1
    }

    let minutes = time.substring(3,5)

    switch (d.getDay()) {
        case 0:     day = 'Domingo';    break;
        case 5:     day = 'Viernes';    break;
        case 6:     day = 'Sábado';     break;
        default:    day = 'Null';       break;
    }

    return (day + ' ' + number_day + ' - ' + hour + ':' + minutes)
}

export function isItSummerTime(month, day){
    if( (month > 3 && month < 11) ||                    // Summer time  27/03 -> 31/10
        (month = 3 && (day > 27 && day < 32)) ){        // Summer time  28/03 29/03 30/03 31/03
        return true;
    }
    return false
}

export const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}