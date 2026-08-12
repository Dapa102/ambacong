const canvas = document.getElementById('map-canvas');
const mapScreen = document.getElementById('map-screen');
const titleEl = document.getElementById('map-title');

const WIDTH = 640;
const HEIGHT = 400;

export const initMapUi = () => {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
};

export const isMapOpen = () => !mapScreen.hidden;

export const openMap = () => {
  mapScreen.hidden = false;
};

export const closeMap = () => {
  mapScreen.hidden = true;
};

export const renderMap = ({ rooms, floor, player, pocong, markers, visibleMarker }) => {
  const context = canvas.getContext('2d');
  const floorRooms = rooms.filter((room) => room.floor === floor);
  const extent = {
    minX: Math.min(...floorRooms.map((room) => room.minX)),
    maxX: Math.max(...floorRooms.map((room) => room.maxX)),
    minZ: Math.min(...floorRooms.map((room) => room.minZ)),
    maxZ: Math.max(...floorRooms.map((room) => room.maxZ)),
  };
  const pad = 16;
  const scaleX = (WIDTH - pad * 2) / (extent.maxX - extent.minX);
  const scaleZ = (HEIGHT - pad * 2) / (extent.maxZ - extent.minZ);
  const transform = (x, z) => ({
    x: pad + (x - extent.minX) * scaleX,
    y: pad + (z - extent.minZ) * scaleZ,
  });

  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#0a0d12';
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const playerRoom = visibleMarker ?? null;
  for (const room of floorRooms) {
    const min = transform(room.minX, room.minZ);
    const max = transform(room.maxX, room.maxZ);
    context.fillStyle =
      room.name === playerRoom ? 'rgba(139, 0, 0, 0.28)' : 'rgba(30, 36, 44, 0.9)';
    context.fillRect(min.x, min.y, max.x - min.x, max.y - min.y);
    context.strokeStyle = room.name === playerRoom ? '#8b0000' : '#444b55';
    context.lineWidth = 1;
    context.strokeRect(min.x, min.y, max.x - min.x, max.y - min.y);
    if (context.measureText) {
      context.fillStyle = '#8f97a3';
      context.font = '10px system-ui, sans-serif';
      context.textAlign = 'center';
      const name = room.name.toUpperCase();
      const cx = (min.x + max.x) / 2;
      const cy = (min.y + max.y) / 2;
      if (Math.min(max.x - min.x, max.y - min.y) > 26) {
        context.fillText(name, cx, cy + 3);
      }
    }
  }

  const drawMarker = (x, z, color, radius, label) => {
    const point = transform(x, z);
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    if (label && context.measureText) {
      context.fillStyle = '#d4d4d4';
      context.font = '10px system-ui, sans-serif';
      context.textAlign = 'left';
      context.fillText(label, point.x + 8, point.y + 3);
    }
  };

  for (const marker of markers) {
    if (marker.type === 'key') drawMarker(marker.x, marker.z, '#d6a800', 4, 'Kunci');
    if (marker.type === 'exit') drawMarker(marker.x, marker.z, '#3fae5a', 4, 'Keluar');
  }

  if (pocong?.visible) {
    drawMarker(pocong.mesh.position.x, pocong.mesh.position.z, '#e02020', 5, 'POCONG');
  }

  const playerPoint = transform(player.position.x, player.position.z);
  context.beginPath();
  context.moveTo(playerPoint.x, playerPoint.y - 6);
  context.lineTo(playerPoint.x - 5, playerPoint.y + 5);
  context.lineTo(playerPoint.x + 5, playerPoint.y + 5);
  context.closePath();
  context.fillStyle = '#ffffff';
  context.fill();

  titleEl.textContent = `PETA RUMAH SAKIT — LANTAI ${floor}`;
};
