/* eslint-disable */
const displayMap = mapElement => {
  const locations = JSON.parse(mapElement.dataset.locations);

  mapboxgl.accessToken =
    'pk.eyJ1IjoiZ29uZ2lzdGEiLCJhIjoiY2swcjJ2c2U3MDF4MjNsbGlnbW9zc2s5OCJ9.INbHqpkQIxhb50XcdJ_o-Q';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/gongista/ck0r3juca08qz1cmlbgh9koc6',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Add to bounds
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 170,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};

export default displayMap;
