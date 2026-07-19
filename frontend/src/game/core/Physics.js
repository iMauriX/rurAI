export const Physics = {
  checkAABB(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  },

  resolveWallCollision(entity, roomBounds) {
    let hitWall = false;
    
    if (entity.x < roomBounds.x) {
      entity.x = roomBounds.x;
      entity.vx = 0;
      hitWall = true;
    }
    if (entity.x + entity.width > roomBounds.x + roomBounds.width) {
      entity.x = roomBounds.x + roomBounds.width - entity.width;
      entity.vx = 0;
      hitWall = true;
    }
    if (entity.y < roomBounds.y) {
      entity.y = roomBounds.y;
      entity.vy = 0;
      hitWall = true;
    }
    if (entity.y + entity.height > roomBounds.y + roomBounds.height) {
      entity.y = roomBounds.y + roomBounds.height - entity.height;
      entity.vy = 0;
      hitWall = true;
    }
    
    return hitWall;
  }
};
