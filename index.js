const req = (url) => {
  let prom = new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open("GET", url);
    req.onload = function () {
      if (req.status == 200) {
        let response = JSON.parse(req.response);
        resolve(response);
      } else {
        reject("Sucedio un error al cargar los datos.");
      }
    };
    req.send();
  });
  return prom;
};

req(
  "https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json"
).then((valorProm) => {
  var cantTrue = 0;
  var cantFalse = 0;
  var numEventos = 0;
  // Calcula cuantos true, cuantos false existen y el numero de eventos
  for (var i = 0; i < valorProm.length; i++) {
    numEventos += 1;
    if (valorProm[i].squirrel == true) {
      cantTrue += 1;
    } else {
      cantFalse += 1;
    }
  }
  //Carga los eventos y los muestra
  var eventos = [];
  for (var i = 0; i < valorProm.length; i++) {
    const tr = document.createElement("tr");
    const num = document.createElement("th");
    const event = document.createElement("td");
    const sqr = document.createElement("td");
    num.textContent = i + 1;
    event.textContent = valorProm[i].events;
    sqr.textContent = valorProm[i].squirrel;
    if (valorProm[i].squirrel == true) {
      tr.style.backgroundColor = "#ff8080";
    }
    tr.appendChild(num);
    tr.appendChild(event);
    tr.appendChild(sqr);
    const table = document.querySelector(".events");
    table.appendChild(tr);
    //Calcula cuantos eventos hay
    //Crea los eventos individuales y sus estadisticas
    var eventInstance = {};
    for (var j = 0; j < valorProm[i].events.length; j++) {
      if (
        typeof eventos.find(
          (element) => element.event == valorProm[i].events[j]
        ) == "undefined"
      ) {
        eventInstance = {
          event: valorProm[i].events[j],
          tp: 0,
          tn: 0,
          fp: 0,
          fn: 0,
          mcc: 0,
        };
        eventos.push(eventInstance);
      } else {
        eventInstance = eventos.find(
          (element) => element.event == valorProm[i].events[j]
        );
      }
      //True Positive
      if (valorProm[i].squirrel == true) {
        eventInstance.tp += 1;
      }
      //False Negative
      else if (valorProm[i].squirrel == false) {
        eventInstance.fn += 1;
      }
      //False Positive
      eventInstance.fp = cantTrue - eventInstance.tp;
      //True Negatives
      eventInstance.tn =
        numEventos - eventInstance.tp - eventInstance.fn - eventInstance.fp;
      //Calcular MCC
      eventInstance.mcc =
        (eventInstance.tp * eventInstance.tn -
          eventInstance.fp * eventInstance.fn) /
        Math.sqrt(
          (eventInstance.tp + eventInstance.fp) *
            (eventInstance.tp + eventInstance.fn) *
            (eventInstance.tn + eventInstance.fp) *
            (eventInstance.tn + eventInstance.fn)
        );
    }
  }

  function compareByMCC(a, b) {
    const mccA = a.mcc;
    const mccB = b.mcc;
    let comp = 0;
    if (mccA > mccB) {
      comp = -1;
    } else if (mccA < mccB) {
      comp = 1;
    }
    return comp;
  }
  // Ordena los elementos y los agrega al HTML
  eventos = eventos.sort(compareByMCC);
  for (var i = 0; i < eventos.length; i++) {
    const tr = document.createElement("tr");
    const num = document.createElement("th");
    const event = document.createElement("td");
    const mcc = document.createElement("td");
    num.textContent = i + 1;
    event.textContent = eventos[i].event;
    mcc.textContent = eventos[i].mcc;
    tr.appendChild(num);
    tr.appendChild(event);
    tr.appendChild(mcc);
    const table = document.querySelector(".correlations");
    table.appendChild(tr);
  }
});
