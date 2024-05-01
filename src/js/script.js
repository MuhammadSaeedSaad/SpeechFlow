document.getElementById('csvFileInput').addEventListener('change', handleFileSelect, false);

let dataPlot, dataPlot1, dataArray, dsAndFs;
const ctx = document.getElementById('myChart');
const ctx1 = document.getElementById('myChart1');
let dNumCell = document.getElementById("dNum");
let fNumCell = document.getElementById("fNum");
let dRatioCell = document.getElementById("dRatio");
let fRatioCell = document.getElementById("fRatio");
let dAvgTime = document.getElementById("dAvgTime");
let fAvgTime = document.getElementById("fAvgTime");
let recodringLenth = document.getElementById("recordingLength");
let sylMins = document.getElementById("sylMins");
let fSylMins = document.getElementById("fSylMins");
let dSylMin = document.getElementById("dSylMins");

function handleFileSelect(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const contents = event.target.result;
      dataArray = parseCSV(contents);
      // console.log(dataArray)
      let recodringLength = dataArray[dataArray.length - 1][0] - dataArray[0][0];
      let numberOfSylablesPerMinute = (dataArray.length / recodringLength) * 30;
      numberOfSylablesPerMinute = Math.round(numberOfSylablesPerMinute * 100) / 100;
      dsAndFs = splitDsFs(dataArray);
      let numberOfFSylablesPerMinute = ((dsAndFs.Fs.labels.length * 2)/ recodringLength) * 30;
      let numberOfDSylablesPerMinute = ((dsAndFs.Ds.labels.length * 2)/ recodringLength) * 30;

      // Do something with the dataArray (e.g., display it, manipulate it, etc.)
      dataPlot = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dsAndFs.Ds.data,
          datasets: [{
            label: 'Dysfluent',
            data: dsAndFs.Ds.occuerance,
            borderWidth: 1,
            borderColor: "#3e95cd"
          }]
        },
        options: {
          tension: 0.4,
          animation: {
            duration: 0
          },
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
                text: 'syllable time ratio (s)'
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
            borderColor: "#3e95cd"
          }]
        },
        options: {
          tension: 0.4,
          animation: {
            duration: 0
          },
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
                text: 'syllable time ratio (s)'
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
      dAvgTime.innerText = Math.round(numsAndRatios.dAvgTime*100)/100;
      fAvgTime.innerText = Math.round(numsAndRatios.fAvgTime*100)/100;
      recodringLenth.innerText = Math.round(recodringLength*100)/100;
      sylMins.innerText = Math.round(numberOfSylablesPerMinute*100)/100;
      fSylMins.innerText = Math.round(numberOfFSylablesPerMinute*100)/100;
      dSylMin.innerText = Math.round(numberOfDSylablesPerMinute*100)/100
    };




    reader.readAsText(file);
  }
}

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

