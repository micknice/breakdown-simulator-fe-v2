import React, { useEffect, useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import io from 'socket.io-client';
import extractLatitudeAndLongitude from '../utils/utils';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWlyZm9yY2UyaGlnaCIsImEiOiJjbGtiYTZ4d2wwYXFnM2JvMHBvcXQ4dWJhIn0.hWAcsZ9TJm7MzibOfoMXDw';

function MapboxMap2() {
  const [viewState, setViewState] = useState({
    width: '100%',
    height: '100%',
    latitude: 54.500000, 
    longitude: -4.2000, 
    zoom: 5.7, 
  });
  const [patrols, setPatrols] = useState({});
  const [markers, setMarkers] = useState([]); 
  const [jobMarkers, setJobMarkers] = useState([]); 
  const [patData, setPatData] = useState([]);
  const [jobLocs, setJobLocs] = useState([]);
  const [selectorValue, setSelectorValue] = useState('option1');
  const [iterationSummary, setIterationSummary] = useState({})
  const [focusView, setFocusView] = useState('patrols')
  const [selectedPatrol, setSelectedPatrol] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  
  useEffect(() => {
    const socket = io('http://localhost:7071');
    socket.on('patrolData', (data) => {
      console.log('Received updated patrols data:', data, Date.now());
      console.log(data);
      console.log(data.liveJobs);
      setPatrols(data);
    });
    socket.on('iterationSummary', (summary) => {
      setIterationSummary(summary)
    })
    socket.on('activeJobLocs', (jobLocsArr) => {
      setJobLocs(jobLocsArr)
      console.log('jobLocs', jobLocs)
    })
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    updateMapMarkers();
  }, [patrols]); 

  useEffect(() => {
    updateJobMarkers();
  }, [jobLocs]); 

  const handleStartSimulation = () => {
    console.log('handler invoked')
    const socket = io('http://localhost:7071');
    socket.emit('sim', `${selectorValue}`)
    
  }
  const handleStopSimulation = () => {
    console.log('handler invoked')
    const socket = io('http://localhost:7071');
    socket.emit('stopSim', `stopSim`)
  }

  const updateJobMarkers = () => {
    console.log('updateJobMarkers invoked', Date.now());
    setJobMarkers(jobLocs)
    console.log('updated job markers', jobMarkers)
  }
  const updateMapMarkers = () => {
    console.log('updateMapMarkers invoked', Date.now());

    const patrolArr = Object.values(patrols);
    if (patrolArr.length > 0) {
      const markerArr = extractLatitudeAndLongitude(patrolArr, markers).map((marker, index) => {

        const onJob = patrolArr[index].onJob;


        const color = onJob ? 'green' : 'red';

 
        return { ...marker, color };
      });

 
      setMarkers(markerArr);
      setPatData(patrolArr);
    }
  };

  return (
    <div  className=' w-full h-full grid grid-cols-12 '>
      
      <div className='relative top-0 left-0 right-0 z-0 h-full px-4 py-4 col-span-2 ' >
        <p className='text-xl px-4 py-4'>AA SIMULATOR</p>
        <div className='text-blue-400'>{patrols.liveJobs}</div>
          <div className='flex flex-col py-2  px-4 outline gap-y-4'>
            <label>
              <div className='flex flex-row'>
                <input
                  type="radio"
                  value={28}
                  checked={selectorValue === 28}
                  onChange={() => setSelectorValue(28)}
                />
                <p className='pl-2'>Overstaffed</p>
              </div>
            </label>
            <label>
              <div className='flex flex-row'>
                <input
                  type="radio"
                  value={17}
                  checked={selectorValue === 17}
                  onChange={() => setSelectorValue(17)}
                />
                <p className='pl-2'>Standard Staffing</p>
              </div>
            </label>
            <label>
              <div className='flex flex-row'>
                <input
                  type="radio"
                  value={10}
                  checked={selectorValue === 10}
                  onChange={() => setSelectorValue(10)}
                />
                <p className='pl-2'>Understaffed</p>
              </div>
            </label>
          </div>
          <div className='flex flex-row gap-x-4 py-4 items-center justify-center'>
            <div className='py-2'>
              <button className='outline rounded bg-white py hover:bg-slate-200 hover:outline-slate-200 ' onClick={handleStartSimulation}>
                <p className='px-2 text-black'>Start Simulation</p>
              </button>
            </div>
            <div className='py-2'>
  
              <button className='outline rounded bg-white hover:bg-slate-200 hover:outline-slate-200'onClick={handleStopSimulation}>
                <p className='px-2 text-black'>Stop Simulation</p>
              </button>
            </div>
          </div>
          <div className='py-4 px-4 outline'>
            <div>
              <p className='text-lg'>Time:</p>
              <p className=''>{iterationSummary.simTime}</p>
            </div>
            <div>
              <p className='text-lg'>Iteration:</p>
              <p className=''>{iterationSummary.iteration}</p>
            </div>
            <div>
              <p className='text-lg'>Breakdowns Logged:</p>
              <p className=''>{iterationSummary.totalJobs}</p>
            </div>
            <div>
              <p className='text-lg'>Live Breakdowns:</p>
              <p className=''>{iterationSummary.liveJobs}</p>
            </div>
            <div>
              <p className='text-lg'>Completed Breakdowns:</p>
              <p className=''>{iterationSummary.completedJobs}</p>
            </div>
            <div>
              <p className='text-lg'>Assigned Patrols:</p>
              <p className='text-green-500'>{iterationSummary.assignedPatrols}</p>
            </div>
            <div>
              <p className='text-lg'>Unassigned Patrols:</p>
              <p className='text-red-500'>{iterationSummary.unassignedPatrols}</p>
            </div>
          </div>
      </div>
      {/* <div className=' absolute top-0 bottom-0 left-0 z-10 -translate-x-1/2'>
        
      </div> */}
      

      <div className='col-span-7'>
        <ReactMapGL
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
         
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
          >
         
          {markers.map((marker, index) => {
            const { color, latitude, longitude } = marker;
            console.log(color)
            const patrolId = patData[index].patrolId
            return (
              <Marker key={index} latitude={latitude} longitude={longitude}>
                <div className='hover:scale-110 '>
                  <div style={{ color }}>
                    <p className='bg-black pointer-events-none font-bold text-white h-5 px-1'>{patrolId}</p>
                    
                    <svg
                      height="15"
                      viewBox="0 0 24 24"
                      style={{
                        cursor: 'pointer',
                        fill: color,
                        stroke: 'none',
                        transform: `translate(${0 / 2}px,${0}px)`,
                      }}
                      >
                      <circle cx="12" cy="12" r="10" T/>
                    </svg>                    
                  </div> 
                </div>            
              </Marker>
            );
          })}
          {jobMarkers.map((marker, index) => {
            const latitude  = marker.coordinates[0];
            const longitude  = marker.coordinates[1];
            return (
              <Marker key={index} latitude={latitude} longitude={longitude}>
                <div className='hover:scale-110 '>
                  <div >
                    <p className='bg-white pointer-events-none font-bold text-black h-5 px-1'>Job: {marker.jobId}</p>
                    {marker.patrolAssigned ? (
                    <svg
                      className='bg-black h-4'
                      viewBox="0 0 24 24"
                      style={{
                        cursor: 'pointer',
                        fill: 'yellow',
                        stroke: 'none',
                        transform: `translate(${0 / 2}px,${0}px)`,
                      }}
                      >
                      <circle cx="12" cy="12" r="10" T>
                        <p></p>
                      </circle>
                    </svg>
                    ) : (
                      <svg
                      className='bg-black h-4'
                      viewBox="0 0 24 24"
                      style={{
                        cursor: 'pointer',
                        fill: 'orange',
                        stroke: 'none',
                        transform: `translate(${0 / 2}px,${0}px)`,
                      }}
                      >
                      <circle cx="12" cy="12" r="10" T>
                        <p></p>
                      </circle>
                    </svg>  
                    )}                  
                  </div> 
                </div>            
              </Marker>
            );
          })}
        </ReactMapGL>
      </div>
      <div className='relative top-0 left-0 right-0 z-0 h-full w-full  px-4 py-4 col-span-3 grid grid-rows-6 gap-y-4' >
        <div className='w-full outline row-span-2'>

        </div>
        <div className='w-full outline row-span-4'>

        </div>
          
      </div>
      
    </div>
  );
}

export default MapboxMap2;
