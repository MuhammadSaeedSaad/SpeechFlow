// document.getElementById('csvFileInput').addEventListener('change', handleFileSelect, false);

let dataPlot, dataPlot1, dataArray, dsAndFs;
const ctx = document.getElementById('myChart');
const ctx1 = document.getElementById('myChart1');
let fileNameCell = document.getElementById("fileName");
let dNumCell = document.getElementById("dNum");
let fNumCell = document.getElementById("fNum");
let dRatioCell = document.getElementById("dRatio");
let fRatioCell = document.getElementById("fRatio");
let dAvgTime = document.getElementById("dAvgTime");
let fAvgTime = document.getElementById("fAvgTime");
let recodringLenth = document.getElementById("recordingLength");
let sylPerMins = document.getElementById("sylMins");
let fSylPerMins = document.getElementById("fSylMins");
let dSylPerMin = document.getElementById("dSylMins");
let inefficientSpeechScoreHtml = document.getElementById("inefficientSpeechScore");
let efficientSpeechScoreHtml = document.getElementById("efficientSpeechScore");
let meanStutteringDurationHtml = document.getElementById("meanStutteringDuration");

window.electron.onFileOpened(handleFileSelect);

function handleFileSelect(event, { filePath, data }) {
  
  const fileName = filePath.split('\\').pop();
  console.log(fileName);
  dataArray = parseCSV(data);
  // fix typos in var identifires
  // let recodringLength = dataArray[dataArray.length - 1][0] - dataArray[0][0];
  let recordingLength = 0;
  for (let i = 0; i < dataArray.length; i += 2) {
    let syllableDuartion = dataArray[i + 1][0] - dataArray[i][0];
    recordingLength += syllableDuartion;
  }

  let fSyllablesDuration = 0;
  let dSyllablesDuration = 0;
  // the following 2 variables are repeates .. fix by using dsAndFs array
  let fSyllablesNumber = 0, dSyllablesNumber = 0;
  for (let i = 0; i < dataArray.length; i += 2) {
    let syllableDuartion = dataArray[i + 1][0] - dataArray[i][0];
    if (dataArray[i][1] == 'F') {
      fSyllablesNumber;
      fSyllablesDuration += syllableDuartion;
    }
    else {
      dSyllablesNumber++;
      dSyllablesDuration += syllableDuartion;
    }
  }

  let inefficientSpeechScore, efficientSpeechScore;
  inefficientSpeechScore = (dSyllablesDuration / recordingLength) * 100;
  efficientSpeechScore = (fSyllablesDuration / recordingLength) * 100;

  let meanStutteringDuration = dSyllablesDuration / dSyllablesNumber;

  let numberOfSylablesPerMinute = (dataArray.length / recordingLength) * 30;
  numberOfSylablesPerMinute = Math.round(numberOfSylablesPerMinute * 100) / 100;
  dsAndFs = splitDsFs(dataArray);
  let numberOfFSylablesPerMinute = ((dsAndFs.Fs.labels.length * 2) / recordingLength) * 30;
  let numberOfDSylablesPerMinute = ((dsAndFs.Ds.labels.length * 2) / recordingLength) * 30;

  let aspectRatio = 3;
  // Chart.defaults.font.size = 15;
  // Do something with the dataArray (e.g., display it, manipulate it, etc.)
  dataPlot = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dsAndFs.Ds.data,
      datasets: [{
        label: 'Dysfluent',
        data: dsAndFs.Ds.occuerance,
        borderWidth: 1,
        // borderColor: "#3e95cd",
        backgroundColor: 'rgba(255, 0, 0, 0.7  )',
      }]
    },
    options: {
      aspectRatio: aspectRatio,
      responsive: true,
      tension: 0.4,
      animation: {
        duration: 0
      },
      // title: {
      //   display: true,
      //   text: 'Custom Chart Title',
      //   font: {
      //     size: 18 // Title font size
      //   }
      // },
      // legend: {
      //   labels: {
      //     display: true,
      //     // This more specific font property overrides the global property
      //     font: {
      //       size: 40,
      //     }
      //   }
      // },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Frequency'
          }
        },
        x: {
          title: {
            display: true,
            text: 'syllable time (s)'
          }
        }
      }
    }
  });

  dataPlot1 = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: dsAndFs.Fs.data,
      datasets: [{
        label: 'Fluent',
        data: dsAndFs.Fs.occuerance,
        borderWidth: 1,
        // borderColor: "#3e95cd",
        backgroundColor: 'rgba(0, 0, 255, 0.7  )',
      }]
    },
    options: {
      aspectRatio: aspectRatio,
      responsive: true,
      tension: 0.4,
      animation: {
        duration: 0
      },
      // title: {
      //   display: true,
      //   text: 'Custom Chart Title',
      //   font: {
      //     size: 18 // Title font size
      //   }
      // },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Frequency'
          }
        },
        x: {
          title: {
            display: true,
            text: 'syllable time (s)'
          }
        }
      }
    }
  });

  const numsAndRatios = getNumsAndRatios(dsAndFs);
  dNumCell.innerText = numsAndRatios.numOfDs;
  fNumCell.innerText = numsAndRatios.numOfFs;
  dRatioCell.innerText = numsAndRatios.dRatio + " %";
  fRatioCell.innerText = numsAndRatios.fRatio + " %";
  dAvgTime.innerText = Math.round(numsAndRatios.dAvgTime * 100) / 100;
  fAvgTime.innerText = Math.round(numsAndRatios.fAvgTime * 100) / 100;
  recodringLenth.innerText = Math.round(recordingLength * 100) / 100;
  sylPerMins.innerText = Math.round(numberOfSylablesPerMinute * 100) / 100;
  fSylPerMins.innerText = Math.round(numberOfFSylablesPerMinute * 100) / 100;
  dSylPerMin.innerText = Math.round(numberOfDSylablesPerMinute * 100) / 100;
  inefficientSpeechScoreHtml.innerText = (Math.round(inefficientSpeechScore * 100) / 100) + ' %';
  efficientSpeechScoreHtml.innerText = (Math.round(efficientSpeechScore * 100) / 100) + ' %';
  meanStutteringDurationHtml.innerText = Math.round(meanStutteringDuration * 100) / 100;
  fileNameCell.innerText = fileName;
}



//     reader.readAsText(file);
//   }
// }

function parseCSV(csvData) {
  const lines = csvData.split('\r\n');
  const dataArray = [];

  for (let i = 0; i < lines.length; i++) {
    const cells = lines[i].split(',');
    dataArray.push(cells)
  }

  return dataArray;
}

function splitDsFs(dataArray) {
  const Ds = { data: [], labels: [], occuerance: [] };
  const Fs = { data: [], labels: [], occuerance: [] };

  for (let i = 0; i < dataArray.length; i += 2) {
    if (i !== dataArray.length - 1) {
      if (dataArray[i][1] == "D") {
        //  Ds.data.push(dataArray[i + 1][0] - dataArray[i][0]);
        // why we are rounding them
        Ds.data.push(Math.round((dataArray[i + 1][0] - dataArray[i][0]) * 100) / 100);
        Ds.labels.push(dataArray[i][1]);
      }

      if (dataArray[i][1] == "F") {
        Fs.data.push(Math.round((dataArray[i + 1][0] - dataArray[i][0]) * 100) / 100);
        Fs.labels.push(dataArray[i][1]);
      }
    }
  }
  Ds.data.sort();
  Fs.data.sort();
  // Ds.data.map((interval, key) => {
  //   let occuerance = 1;
  //   while (Ds.data[key + occuerance] === interval) {
  //     occuerance++;
  //   }
  //   console.log("element: " + interval + " occurence: " + occuerance);
  //   return [interval, occuerance];
  // });
  for (let i = 0; i < Ds.data.length; i++) {
    let occuerance = 1;
    let movingIndex = 1;
    while (Ds.data[i + movingIndex] === Ds.data[i]) {
      Ds.data.splice(i, 1);
      occuerance++;
    }
    Ds.occuerance[i] = occuerance;
  }


  for (let i = 0; i < Fs.data.length; i++) {
    let occuerance = 1;
    let movingIndex = 1;
    while (Fs.data[i + movingIndex] === Fs.data[i]) {
      Fs.data.splice(i, 1);
      occuerance++;
    }
    Fs.occuerance[i] = occuerance;
    // Ds.data[i] = [Ds.data[i], occuerance];
  }
  return { Ds, Fs }
}

function getNumsAndRatios(dsAndFs) {
  const numOfDs = dsAndFs.Ds.labels.length;
  const numOfFs = dsAndFs.Fs.labels.length;
  let dRatio = (numOfDs * 100) / (numOfDs + numOfFs);
  let fRatio = (numOfFs * 100) / (numOfDs + numOfFs);
  dRatio = Math.round(dRatio * 100) / 100
  fRatio = Math.floor(fRatio * 100) / 100;

  let dAvgTime = (dsAndFs.Ds.data[dsAndFs.Ds.data.length - 1] + dsAndFs.Ds.data[dsAndFs.Ds.data.length - 2] + dsAndFs.Ds.data[dsAndFs.Ds.data.length - 3]) / 3;
  let fAvgTime = (dsAndFs.Fs.data[dsAndFs.Fs.data.length - 1] + dsAndFs.Fs.data[dsAndFs.Fs.data.length - 2] + dsAndFs.Fs.data[dsAndFs.Fs.data.length - 3]) / 3;

  // let recodringLenth = 

  console.log("fAvgTime " + fAvgTime)

  return { numOfDs, numOfFs, dRatio, fRatio, dAvgTime, fAvgTime };
}

