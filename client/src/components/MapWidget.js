import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from '!mapbox-gl';
import ACCESS_TOKEN from './accessToken';

mapboxgl.accessToken = ACCESS_TOKEN;

function MapWidget({ lon, lat }) {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const markerRef = useRef(new mapboxgl.Marker({
        color: 'red',
    }));

    useEffect(() => {
        if (!map) {
            const newMap = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [lon, lat],
                zoom: 10,
                attributionControl: false
            });

            newMap.on('load', () => {
                const marker = new mapboxgl.Marker({
                    color: 'red',
                });

                marker.setLngLat([lon, lat]);
                marker.addTo(newMap);
                markerRef.current = marker;

                setMap(newMap);
            });
        } else {
            map.setCenter([lon, lat]);
            markerRef.current.setLngLat([lon, lat]);
        }

        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [lon, lat, map]);

    return <div
        ref={mapContainer}
        style={{ width: '400px', height: '200px' }
        }
    />;
};

export default MapWidget;
