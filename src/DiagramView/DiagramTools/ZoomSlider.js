import React from 'react';
import * as _ from 'lodash';
import { Icon, Popup } from 'semantic-ui-react';
import { EventSystem } from '@medlor/medlor-core-lib';
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider'

const Handle = ({ // your handle component
    handle: { id, value, percent }, 
    getHandleProps
  }) => {
    return (
      <div
        style={{
          left: `${percent}%`,
          position: 'absolute',
          marginLeft: -15,
          marginTop: 25,
          zIndex: 2,
          width: 30,
          height: 30,
          border: 0,
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '50%',
          backgroundColor: '#2C4870',
          color: '#333',
        }}
        {...getHandleProps(id)}
      >
        <div style={{ fontFamily: 'Roboto', fontSize: 11, marginTop: -35, color: 'white' }}>
          {value}
        </div>
      </div>
    )
};

const Track = ({ source, target, getTrackProps }) => { // your own track component
    return (
        <div
            style={{
            position: 'absolute',
            height: 10,
            zIndex: 1,
            marginTop: 35,
            backgroundColor: '#546C91',
            borderRadius: 5,
            cursor: 'pointer',
            left: `${source.percent}%`,
            width: `${target.percent - source.percent}%`,
            }}
            {...getTrackProps()} // this will set up events if you want it to be clickeable (optional)
        />
    )
}

const handleZoomUpdate = (values) => {
    EventSystem.publish('ZOOM_SLIDER', values);
};

const debounceZoomUpdate = _.debounce(handleZoomUpdate, 10);

const ZoomSlider = ({ values, onZoomToFit, onZoomOut, onZoomIn }) => (
    <Slider
        rootStyle={{ position: 'fixed', zIndex: 100, bottom: '80px', right: '50px', width: '200px' }}
        domain={[20, 400]}
        step={1}
        mode={2}
        values={values}
        onUpdate={debounceZoomUpdate}
    >
        <Rail>
        {({ getRailProps }) => (  // adding the rail props sets up events on the rail
            <div style={{
                position: 'absolute',
                left: 0,
                marginTop: '35px',
                width: '100%',
                height: '10px',
                borderRadius: 4,
                cursor: 'pointer',
                backgroundColor: 'rgb(100,100,100)'
            }} {...getRailProps()} /> 
        )}
        </Rail>
        <Handles>
        {({ handles, getHandleProps }) => (
            <div className="slider-handles">
            {handles.map(handle => (
                <Handle
                key={handle.id}
                handle={handle}
                getHandleProps={getHandleProps}
                />
            ))}
            </div>
        )}
        </Handles>
        <Tracks right={false}>
        {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
            {tracks.map(({ id, source, target }) => (
                <Track
                key={id}
                source={source}
                target={target}
                getTrackProps={getTrackProps}
                />
            ))}
            </div>
        )}
        </Tracks>
        <Popup trigger={(
            <Icon
                link
                onClick={onZoomToFit}
                name="arrows alternate horizontal"
                size="large"
                style={{ position: 'fixed', marginTop: '30px', marginLeft: '-75px' }}
            />)}
            content="Zoom to Fit"
        />
        <Popup trigger={(
            <Icon
                link
                onClick={onZoomOut}
                name="zoom-out"
                size="large"
                style={{ position: 'fixed', marginTop: '30px', marginLeft: '-35px' }}
            />)}
            content="Zoom Out"
        />
        <Popup trigger={(
            <Icon
                link
                onClick={onZoomIn}
                name="zoom-in"
                size="large"
                style={{ position: 'fixed', marginTop: '30px', marginLeft: '215px' }}
            />)}
            content="Zoom In"
        />
    </Slider>
);

export default ZoomSlider;
