export const Physics = {
  checkAABB(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  },

  resolveAABBCollision(a, b) {
    // Calculate half sizes
    const aHalfW = a.width / 2;
    const aHalfH = a.height / 2;
    const bHalfW = b.width / 2;
    const bHalfH = b.height / 2;

    // Calculate centers
    const aCenterX = a.x + aHalfW;
    const aCenterY = a.y + aHalfH;
    const bCenterX = b.x + bHalfW;
    const bCenterY = b.y + bHalfH;

    // Calculate distance between centers
    const diffX = aCenterX - bCenterX;
    const diffY = aCenterY - bCenterY;

    // Calculate minimum translation distance
    const minXDist = aHalfW + bHalfW;
    const minYDist = aHalfH + bHalfH;

    // Calculate depth of collision
    const depthX = minXDist - Math.abs(diffX);
    const depthY = minYDist - Math.abs(diffY);

    if (depthX > 0 && depthY > 0) {
      // Resolve along the axis of least penetration
      if (depthX < depthY) {
        if (diffX > 0) {
          a.x += depthX; // Push right
        } else {
          a.x -= depthX; // Push left
        }
      } else {
        if (diffY > 0) {
          a.y += depthY; // Push down
        } else {
          a.y -= depthY; // Push up
        }
      }
      return true;
    }
    return false;
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
