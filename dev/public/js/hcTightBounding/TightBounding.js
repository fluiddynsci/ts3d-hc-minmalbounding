import { dummy } from './qhull.js';


export class TightBounding {



    static async _showBoundingMesh(viewer, nodeid) {
        let model = viewer.model;
        let bounding = await model.getNodesBounding([nodeid]);
        let mesh = await TightBounding._createBoundingMesh(viewer, bounding.min, bounding.max);
        let myMeshInstanceData = new Communicator.MeshInstanceData(mesh);
        let ttt = hwv.model.createNode( hwv.model.getRootNode());
        let  cubenode = await viewer.model.createMeshInstance(myMeshInstanceData, ttt);
        return cubenode;
    }



    static async _getMeshPointsRecursive(viewer, nodeid, points, matrix) {
        let children = await hwv.model.getNodeChildren(nodeid);

        if (children.length == 0) {
            let meshdata = await hwv.model.getNodeMeshData(nodeid);
            if (meshdata) {
                let tpoints = [];

                let netmatrix = viewer.model.getNodeNetMatrix(nodeid);
                let totalmatrix = Communicator.Matrix.multiply(matrix, netmatrix);

                let data = await hwv.model.getNodeMeshData(nodeid);

                for (let i = 0; i < data.faces.elementCount; i++) {
                    let face = data.faces.element(i);
                    let pp = face.iterate();
                    for (let j = 0; j < face.vertexCount; j += 3) {
                        for (let k = 0; k < 3; k++) {
                            let rawpoint = pp.next();
                            let p = new Communicator.Point3(rawpoint.position[0], rawpoint.position[1], rawpoint.position[2]);
                             tpoints.push([p.x,p.y,p.z]);
//                            let tp = totalmatrix.transform(p);
  //                          points.push(tp);
                        }
                    }
                }
                let res = new QuickHull(tpoints);
                res.build();
                let faces = res.collectFaces();
                let phash = [];
                for (let i = 0; i < faces.length; i++) {
                    let face = faces[i];
                    for (let j = 0; j < 3; j++) {
                        let pi = face[j]
                        if (phash[pi] == undefined) {
                            phash[pi] = 1;
                            let p = new Communicator.Point3(tpoints[pi][0], tpoints[pi][1], tpoints[pi][2]);
                            let tp = totalmatrix.transform(p);
                            points.push(tp);
                        }
                    }
                }
   

//                 let res = TightBounding._convexHull(tpoints);
                //  for (let i = 0; i < res.length; i++) {
                //      let p = new Communicator.Point3(res[i][0], res[i][1], res[i][2]);
                //      let tp = totalmatrix.transform(p);
                //      points.push(tp);
                //  }
            }
        }


        for (let i = 0; i < children.length; i++) {
            await TightBounding._getMeshPointsRecursive(viewer, children[i], points, matrix);
        }
    }

    static async _getMeshPoints(viewer, nodeid) {
        let points = [];
        var netmatrix = viewer.model.getNodeNetMatrix(nodeid);
        var netmatrixinverse = Communicator.Matrix.inverse(netmatrix);

        await TightBounding._getMeshPointsRecursive(viewer, nodeid, points, netmatrixinverse);
        return points;
    }
  
    static async calculatePointBounding(viewer,nodeid) {
        let points = await TightBounding._getMeshPoints(viewer,nodeid);
        

        await TightBounding.randomRotation(viewer,nodeid);

        let min = new Communicator.Point3(1000000000,1000000000,1000000000);
        let max = new Communicator.Point3(-1000000000,-1000000000,-1000000000);

        var netmatrix = viewer.model.getNodeNetMatrix(nodeid);
        var matrix = viewer.model.getNodeMatrix(nodeid);
        var mult = Communicator.Matrix.multiply(netmatrix,matrix);


        for (let i = 0; i < points.length; i++) {
            let p = netmatrix.transform(points[i]);
            if (p.x < min.x) min.x = p.x;
            if (p.y < min.y) min.y = p.y;
            if (p.z < min.z) min.z = p.z;
            if (p.x > max.x) max.x = p.x;
            if (p.y > max.y) max.y = p.y;
            if (p.z > max.z) max.z = p.z;
        }

        let mesh = await TightBounding._createBoundingMesh(viewer, min, max);
        let myMeshInstanceData = new Communicator.MeshInstanceData(mesh);
        let ttt = hwv.model.createNode( hwv.model.getRootNode());
        let  cubenode = await viewer.model.createMeshInstance(myMeshInstanceData, ttt);
        return cubenode;
        
    }


    static async calculateTightBounding(viewer,nodeid) {
        let points = await TightBounding._getMeshPoints(viewer,nodeid);

        let smallest = {volume:10000000000,angle:0,axis:new Communicator.Point3(1,0,0), min:new Communicator.Point3(0,0,0), max:new Communicator.Point3(0,0,0)};

        let origmatrix = viewer.model.getNodeMatrix(nodeid);
        let bounding = await viewer.model.getNodesBounding([nodeid]);
        for (let i=0;i<15000;i++) {

            let angle = 0;
            let axis = null

           // if (i > 0) {
                angle = Math.random() *360;
                //angle  = 0;
                axis = new Communicator.Point3(Math.random(), Math.random(), Math.random());
                axis.normalize();        
                //axis = new Communicator.Point3(0,0,1);
//                viewer.model.setNodeMatrix(nodeid,origmatrix);
             let matrix = await TightBounding._rotateNodeFromHandle(viewer,nodeid,axis,angle, bounding.center(), false);
          //  }

            let min = new Communicator.Point3(1000000000,1000000000,1000000000);
            let max = new Communicator.Point3(-1000000000,-1000000000,-1000000000);
    
            let netmatrix2 = viewer.model.getNodeNetMatrix(viewer.model.getNodeParent(nodeid));
            let netmatrix = Communicator.Matrix.multiply(matrix,netmatrix2);

    
            for (let j = 0; j < points.length; j++) {
                let p = netmatrix.transform(points[j]);
                if (p.x < min.x) min.x = p.x;
                if (p.y < min.y) min.y = p.y;
                if (p.z < min.z) min.z = p.z;
                if (p.x > max.x) max.x = p.x;
                if (p.y > max.y) max.y = p.y;
                if (p.z > max.z) max.z = p.z;
            }

            let volume = (max.x-min.x)*(max.y-min.y)*(max.z-min.z);
            if (volume < smallest.volume) {
                smallest.volume = volume;
                smallest.angle = angle;
                smallest.axis = axis;
                smallest.min = min;
                smallest.max = max;
            }

        }

        if (smallest.axis != null) {
            viewer.model.setNodeMatrix(nodeid,origmatrix);
            await TightBounding._rotateNodeFromHandle(viewer,nodeid,smallest.axis,smallest.angle,bounding.center(), true)
        }
        else {
            viewer.model.setNodeMatrix(nodeid,origmatrix);
        }
       
        let mesh = await TightBounding._createBoundingMesh(viewer, smallest.min, smallest.max);
        let myMeshInstanceData = new Communicator.MeshInstanceData(mesh);
        let ttt = hwv.model.createNode( hwv.model.getRootNode());
        let  cubenode = await viewer.model.createMeshInstance(myMeshInstanceData, ttt);
        return cubenode;
        
    }


 

    static async randomRotation(viewer,nodeid) {

        let angle = Math.random() *360;
        let axis = new Communicator.Point3(Math.random(), Math.random(), Math.random());
        axis.normalize();
        await TightBounding._rotateNodeFromHandle(viewer,nodeid,axis,angle)
    }


    static async _rotateNodeFromHandle(viewer,nodeid,axis,angle, center, apply)
    {
            let pos = center;  
    
            var netmatrix = hwv.model.getNodeNetMatrix(nodeid);
            var netmatrixinverse = Communicator.Matrix.inverse(netmatrix);
            var pivot = netmatrixinverse.transform(pos);

            var pivotaxis = netmatrixinverse.transform(new Communicator.Point3(pos.x + axis.x, pos.y + axis.y, pos.z + axis.z));
            var resaxis = Communicator.Point3.subtract(pivotaxis, pivot).normalize();

            return await TightBounding.rotateNode(viewer,nodeid,angle,pivot,resaxis, apply);
            

    }

    static async rotateNode(viewer, nodeid,angle,center,axis,apply)
    {
     
        var startmatrix = hwv.model.getNodeMatrix(nodeid);
        var offaxismatrix = new Communicator.Matrix();
        var transmatrix = new Communicator.Matrix();        

        transmatrix = new Communicator.Matrix();
        transmatrix.setTranslationComponent(-center.x, -center.y, -center.z);

        var invtransmatrix = new Communicator.Matrix();
        invtransmatrix.setTranslationComponent(center.x, center.y, center.z);

        Communicator.Util.computeOffaxisRotation(axis, angle, offaxismatrix);

        var result = Communicator.Matrix.multiply(transmatrix, offaxismatrix);
        var result2 = Communicator.Matrix.multiply(result, invtransmatrix);

        let final = Communicator.Matrix.multiply(result2, startmatrix);
        if (apply) {
            await viewer.model.setNodeMatrix(nodeid, final);
        }
        return final;
    }



    static async _performRandomRotation(viewer, nodeid, origmatrix) {

        let netmatrix = viewer.model.getNodeNetMatrix(viewer.model.getNodeParent(nodeid));
        let netmatrixinverse = Communicator.Matrix.inverse(netmatrix);
        let bounding = await viewer.model.getNodesBounding([nodeid]);
        let rcenter = netmatrixinverse.transform(bounding.center());
        let rcenter2 = netmatrixinverse.transform(new Communicator.Point3(0,0,0));
        let delta = Communicator.Point3.subtract(rcenter2, rcenter);
        let m2 = new Communicator.Matrix();
        m2.setTranslationComponent(-delta.x, -delta.y, -delta.z);
        let m3 = new Communicator.Matrix();
        m3.setTranslationComponent(delta.x, delta.y, delta.z);

        let m = new Communicator.Matrix.createFromOffAxisRotation(new Communicator.Point3(1,0,0), Math.random()*90);
        let t1 = Communicator.Matrix.multiply(m, m2);
        let t2 = Communicator.Matrix.multiply(t1, m3);

        let tempmatrix = Communicator.Matrix.multiply(netmatrix, t2);
        let tempmatrix2= Communicator.Matrix.multiply(tempmatrix, netmatrixinverse);
        let resultmatrix = Communicator.Matrix.multiply(origmatrix, tempmatrix2);
        viewer.model.setNodeMatrix(nodeid, tempmatrix2)        
    }



    static async _createBoundingMesh(viewer, min, max) {

        var meshData = new Communicator.MeshData();
                   
        var polylines = [
            [
                min.x, min.y, min.z, 
                max.x, min.y, min.z, 
                max.x, max.y, min.z,
                min.x, max.y, min.z,
                min.x, min.y, min.z
            ],
            [
                min.x, min.y, max.z, 
                max.x, min.y, max.z,
                max.x, max.y, max.z,
                min.x, max.y, max.z,
                min.x, min.y, max.z
            ],
            [
                min.x, min.y, min.z,
                min.x, min.y, max.z,
                max.x, min.y, max.z,
                max.x, max.y, max.z,
                min.x, max.y, max.z
            ],
            [
                max.x, max.y, min.z,
                max.x, max.y, max.z,
            ],
            [
                min.x, max.y, min.z,
                min.x, max.y, max.z,
            ],
            [
                max.x, min.y, min.z,
                max.x, min.y, max.z,
            ],
        ];
        for (let i = 0; i < polylines.length; i++) {
            meshData.addPolyline(polylines[i]);
        }
        return await viewer.model.createMesh(meshData);
    }


    static _convexHull(points) {
        // Find the point with the lowest x-coordinate
        const minPoint = points.reduce((min, point) => point[0] < min[0] ? point : min);

        // Find the point with the highest x-coordinate
        const maxPoint = points.reduce((max, point) => point[0] > max[0] ? point : max);

        // Divide the points into two sets based on which side of the line between the min and max points they lie on
        const leftSet = [];
        const rightSet = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (point !== minPoint && point !== maxPoint) {
                if (TightBounding._isPointOnLeft(minPoint, maxPoint, point)) {
                    leftSet.push(point);
                } else {
                    rightSet.push(point);
                }
            }
        }

        // Recursively build the convex hull for the left and right sets of points
        const hull = [];
        hull.push(minPoint);
        hull.push(...TightBounding._buildHull(leftSet, minPoint, maxPoint));
        hull.push(maxPoint);
        hull.push(...TightBounding._buildHull(rightSet, maxPoint, minPoint));

        return hull;
    }

    static _buildHull(points, start, end) {
        if (points.length === 0) {
            return [];
        }

        // Find the point furthest from the line between the start and end points
        const farthestPoint = points.reduce((farthest, point) => {
            const distance = TightBounding._getPointLineDistance(start, end, point);
            if (distance > farthest.distance) {
                return { point, distance };
            }
            return farthest;
        }, { point: null, distance: 0 }).point;

        // Divide the remaining points into two sets based on which side of the line between the start and end points they lie on
        const leftSet = [];
        const rightSet = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (point !== farthestPoint) {
                if (TightBounding._isPointOnLeft(start, farthestPoint, point)) {
                    leftSet.push(point);
                } else if (TightBounding._isPointOnLeft(farthestPoint, end, point)) {
                    rightSet.push(point);
                }
            }
        }

        // Recursively build the convex hull for the left and right sets of points
        const hull = [];
        hull.push(...TightBounding._buildHull(leftSet, start, farthestPoint));
        hull.push(farthestPoint);
        hull.push(...TightBounding._buildHull(rightSet, farthestPoint, end));

        return hull;
    }

    static _isPointOnLeft(start, end, point) {
        const ax = end[0] - start[0];
        const ay = end[1] - start[1];
        const az = end[2] - start[2];
        const bx = point[0] - start[0];
        const by = point[1] - start[1];
        const bz = point[2] - start[2];
        const crossProduct = [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx,];
        return crossProduct[0] + crossProduct[1] + crossProduct[2] < 0;
    }

    static _getPointLineDistance(start, end, point) {
        const ax = end[0] - start[0];
        const ay = end[1] - start[1];
        const az = end[2] - start[2];
        const bx = point[0] - start[0];
        const by = point[1] - start[1];
        const bz = point[2] - start[2];
        const dotProduct = ax * bx + ay * by + az * bz;
        const lengthSquared = ax * ax + ay * ay + az * az;
        const projection = [start[0] + (dotProduct / lengthSquared) * ax, start[1] + (dotProduct / lengthSquared) * ay, start[2] + (dotProduct / lengthSquared) * az];
        const distance = Math.sqrt((point[0] - projection[0]) ** 2 + (point[1] - projection[1]) ** 2 + (point[2] - projection[2]) ** 2);
        return distance;
    }


}
