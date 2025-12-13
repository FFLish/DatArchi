// Sidebar (left navbar) component script
export function initSidebar() {
  const zoneList = document.getElementById('zoneList');
  if (!zoneList) return;
  
  const zones = zoneList.querySelectorAll('li');
  zones.forEach(zone => {
    zone.addEventListener('click', (e) => {
      zones.forEach(z => z.classList.remove('active'));
      zone.classList.add('active');
      console.log('Zone selected:', zone.dataset.zone);
    });
  });
}

// Initialize sidebar on page load
document.addEventListener('DOMContentLoaded', initSidebar);
