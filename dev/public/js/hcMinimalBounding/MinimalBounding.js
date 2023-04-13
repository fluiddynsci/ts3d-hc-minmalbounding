import { dummy } from './qhull.js';


export class MinimalBounding {

    static async calculateMinimalBounding(viewer, nodeid, iterations = 10000, origBoundsBias = 0.9, steps = 1) {

        let points = await MinimalBounding._getMeshPoints(viewer, nodeid);
        let smallest = { volume: Number.MAX_VALUE, angle: 0, axis: new Communicator.Point3(1, 0, 0), min: new Communicator.Point3(0, 0, 0), max: new Communicator.Point3(0, 0, 0) };

        let origvolume = Number.MAX_VALUE;

        let bounding = await viewer.model.getNodesBounding([nodeid]);
        let axis;
        for (let i = 0; i < 4; i++) {
            let kend = 360 / steps;
            if (i == 0) {
                axis = new Communicator.Point3(0, 0, 1);
            }
            else if (i == 1) {
                axis = new Communicator.Point3(0, 1, 0);
            }
            else if (i == 2) {
                axis = new Communicator.Point3(1, 0, 0);
            }
            else {
                kend = iterations;
            }
            for (let k = 0; k < kend; k++) {

                let angle;
                if (i > 2) {

                    axis = new Communicator.Point3(Math.random(), Math.random(), Math.random());
                    axis.normalize();
                    angle = Math.random() * 360;
                }
                else {
                    angle = k * steps;
                }

                let matrix = await MinimalBounding._rotateNode(viewer, nodeid, axis, angle, bounding.center(), false);

                let min = new Communicator.Point3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
                let max = new Communicator.Point3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

                let netmatrix2 = viewer.model.getNodeNetMatrix(viewer.model.getNodeParent(nodeid));
                let netmatrix = Communicator.Matrix.multiply(matrix, netmatrix2);
                
                let resp = [];
                netmatrix.transformArray(points, resp);
                for (let j = 0; j < points.length; j++) {
                    let p = resp[j];
                    if (p.x < min.x) min.x = p.x;
                    if (p.y < min.y) min.y = p.y;
                    if (p.z < min.z) min.z = p.z;
                    if (p.x > max.x) max.x = p.x;
                    if (p.y > max.y) max.y = p.y;
                    if (p.z > max.z) max.z = p.z;
                }

                let volume = (max.x - min.x) * (max.y - min.y) * (max.z - min.z);

                if (volume < smallest.volume) {

                    if ((volume / origvolume) > origBoundsBias) {
                        continue;
                    }
                    if (i < 3) {
                        origvolume = volume;
                    }
                    smallest.volume = volume;
                    smallest.angle = angle;
                    smallest.axis = axis;
                    smallest.min = min;
                    smallest.max = max;
                }

            }
        }

        let mesh = await MinimalBounding._createBoundingMesh(viewer, smallest.min, smallest.max);
        let myMeshInstanceData = new Communicator.MeshInstanceData(mesh);
        let boundingNode = viewer.model.createNode(viewer.model.getRootNode(), "Minimal Bounding for " + nodeid);

        let tempNode = await viewer.model.createMeshInstance(myMeshInstanceData, boundingNode);
        await MinimalBounding._rotateNode(viewer, tempNode, smallest.axis, -smallest.angle, bounding.center(), true)
        return {nodeid: boundingNode, volume: smallest.volume, min: smallest.min, max: smallest.max};

    }

    static async calculateConvexHullPoints(viewer, nodeid) {
        let points = [];
        var netmatrix = viewer.model.getNodeNetMatrix(nodeid);
        var netmatrixinverse = Communicator.Matrix.inverse(netmatrix);
        await MinimalBounding._getMeshPointsRecursive(viewer, nodeid, points, netmatrixinverse, true);

        let res = new QuickHull(points);
        res.build();

        let faces = res.collectFaces();
        var meshData = new Communicator.MeshData();
        meshData.setFaceWinding(Communicator.FaceWinding.None);
        let meshFaces = [];
        let uniquePoints = [];
        for (let i = 0; i < faces.length; i++) {
            let face = faces[i];
            for (let j = 0; j < 3; j++) {
                let pi = face[j]
                let pstring = points[pi][0] + "," + points[pi][1] + "," + points[pi][2];
                if (uniquePoints[pstring] == undefined) {
                    uniquePoints[pstring] = new Communicator.Point3(points[pi][0], points[pi][1], points[pi][2]);
                }
            }
        }
        let uniquePointsArray = [];
        for (let i in uniquePoints) {
            uniquePointsArray.push(uniquePoints[i]);
        }

        return uniquePointsArray;
    }


    static async showConvexHull(viewer, nodeid) {
        let points = [];
        var netmatrix = viewer.model.getNodeNetMatrix(nodeid);
        var netmatrixinverse = Communicator.Matrix.inverse(netmatrix);
        await MinimalBounding._getMeshPointsRecursive(viewer, nodeid, points, netmatrixinverse, true);

        let res = new QuickHull(points);
        res.build();
        let faces = res.collectFaces();
        var meshData = new Communicator.MeshData();
        meshData.setFaceWinding(Communicator.FaceWinding.None);
        let meshFaces = [];
        for (let i = 0; i < faces.length; i++) {
            let face = faces[i];
            for (let j = 0; j < 3; j++) {
                let pi = face[j]
                meshFaces.push(points[pi][0], points[pi][1], points[pi][2]);
            }
        }

        meshData.addFaces(meshFaces);
        let meshid = await viewer.model.createMesh(meshData);
        let myMeshInstanceData = new Communicator.MeshInstanceData(meshid);
        var hullNode = viewer.model.createNode(viewer.model.getRootNode(), "Convex Hull for " + nodeid);
        await viewer.model.createMeshInstance(myMeshInstanceData, hullNode);
        return hullNode;
    }


    static async showBoundingMesh(viewer, nodeid) {
        let model = viewer.model;
        let bounding = await model.getNodesBounding([nodeid], { tightBounding: true });
        let mesh = await MinimalBounding._createBoundingMesh(viewer, bounding.min, bounding.max);
        let myMeshInstanceData = new Communicator.MeshInstanceData(mesh);
        let boundingNode = viewer.model.createNode(viewer.model.getRootNode(), "Bounding for " + nodeid);
        let tempNode = await viewer.model.createMeshInstance(myMeshInstanceData, boundingNode);
        viewer.model.setNodesLineColor([tempNode], new Communicator.Color(0, 0, 255));
        return boundingNode;
    }

    static async _getMeshPointsRecursive(viewer, nodeid, points, matrix, useLocalMatrix = false) {
        let children = await viewer.model.getNodeChildren(nodeid);

        try {
            if (children.length == 0) {

                let meshdata = await viewer.model.getNodeMeshData(nodeid);
                if (meshdata) {

                    let totalmatrix;
                    if (!useLocalMatrix) {
                        let netmatrix = viewer.model.getNodeNetMatrix(nodeid);
                        totalmatrix = Communicator.Matrix.multiply(netmatrix, matrix);
                    }
                    else {
                        totalmatrix = viewer.model.getNodeNetMatrix(nodeid);

                    }

                    let data = await viewer.model.getNodeMeshData(nodeid);

                    for (let i = 0; i < data.faces.elementCount; i++) {
                        let face = data.faces.element(i);
                        let pp = face.iterate();
                        for (let j = 0; j < face.vertexCount; j += 3) {
                            for (let k = 0; k < 3; k++) {
                                let rawpoint = pp.next();
                                let p = new Communicator.Point3(rawpoint.position[0], rawpoint.position[1], rawpoint.position[2]);
                                let tp = totalmatrix.transform(p);
                                points.push([tp.x, tp.y, tp.z]);
                            }
                        }
                    }
                }
            }
        } catch (e) {

        }

        for (let i = 0; i < children.length; i++) {
            await MinimalBounding._getMeshPointsRecursive(viewer, children[i], points, matrix, useLocalMatrix);
        }
    }

    static async _getMeshPoints(viewer, nodeid) {
        let points = [];
        var netmatrix = viewer.model.getNodeNetMatrix(nodeid);
        var netmatrixinverse = Communicator.Matrix.inverse(netmatrix);

        await MinimalBounding._getMeshPointsRecursive(viewer, nodeid, points, netmatrixinverse);

        let respoints = [];
        let res = new QuickHull(points);
        res.build();
        let faces = res.collectFaces();
        let phash = [];
        for (let i = 0; i < faces.length; i++) {
            let face = faces[i];
            for (let j = 0; j < 3; j++) {
                let pi = face[j]
                if (phash[pi] == undefined) {
                    phash[pi] = 1;
                    let p = new Communicator.Point3(points[pi][0], points[pi][1], points[pi][2]);
                    respoints.push(p);
                }
            }
        }
        return respoints;
    }

    static async _rotateNode(viewer, nodeid, axis, angle, center, apply) {
        let pos = center;

        var netmatrix = viewer.model.getNodeNetMatrix(nodeid);
        var netmatrixinverse = Communicator.Matrix.inverse(netmatrix);
        var pivot = netmatrixinverse.transform(pos);

        var pivotaxis = netmatrixinverse.transform(new Communicator.Point3(pos.x + axis.x, pos.y + axis.y, pos.z + axis.z));
        var resaxis = Communicator.Point3.subtract(pivotaxis, pivot).normalize();

        return await MinimalBounding._rotateNodeOffaxis(viewer, nodeid, angle, pivot, resaxis, apply);
    }

    static async _rotateNodeOffaxis(viewer, nodeid, angle, center, axis, apply) {

        var startmatrix = viewer.model.getNodeMatrix(nodeid);
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




    static async fitNodesExact(viewer,nodeids, config) {
        let bounding = await viewer.model.getNodesBounding(nodeids, config);
        const extents = bounding.extents();
        const extentsLength = extents.length();
        let camera = viewer.view.getCamera();
        const height = camera.getHeight();
        const eye = Communicator.Point3.subtract(camera.getPosition(), camera.getTarget());
        const eyeLength = eye.length();
        const newEyeLength = (extentsLength * height) / height;
        let target = bounding.center();
        let position = Communicator.Point3.add(target, eye.normalize().scale(newEyeLength));
            
        camera.setTarget(target);
        camera.setPosition(position);
    
        camera.setWidth(extentsLength);
        camera.setHeight(extentsLength);
    
        let vw = $(viewer.getViewElement()).width();
        let vh = $(viewer.getViewElement()).height();
        
        let corners = await MinimalBounding.calculateConvexHullPoints(viewer, nodeids[0]);
        // let corners  = [];
        // await getMeshPointsRecursive(viewer, nodeids[0], corners);

        let mat = camera.getFullMatrix(viewer);
        let matinv = Communicator.Matrix.inverse(mat);
    
        let bbox = new Communicator.Box(new Communicator.Point3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE), new Communicator.Point3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE));
        let mindist = Number.MAX_VALUE
        for (let i = 0; i < corners.length; i++) {
            let l = Communicator.Point3.subtract(position, corners[i]).length();
            if (l < mindist) {
                mindist = l;
            }
            let pp = viewer.view.projectPoint(corners[i], camera);
            pp.z = 0;
            bbox.addPoint(pp);
        }
        let center = bbox.center();
    
    
        let pmat = camera.getProjectionMatrix(viewer);
        let pmatinv = Communicator.Matrix.inverse(pmat);
    
        let vmat = camera.getViewMatrix(viewer);
        let vmatinv = Communicator.Matrix.inverse(vmat);
    
        let rcenter2 = pmatinv.transform(new Communicator.Point3(center.x/vw*2-1,(vh-center.y)/vh*2-1,0));
        let rcenter3 = vmat.transform(camera.getPosition());
    
        position = camera.getPosition()
        target = camera.getTarget()
      
        rcenter2.z = rcenter3.z;
        let world = vmatinv.transform(rcenter2);
        let delta = Communicator.Point3.subtract(position, world);
    
    
         camera.setPosition(world);
         camera.setTarget(Communicator.Point3.subtract(target, delta));
    
        let zoomIn = false;

    
        for (let j = 1; j < 150; j++) {

            let tooBig = false;
            for (let i = 0; i < corners.length; i++) {
                let pp = viewer.view.projectPoint(corners[i], camera);
                if (pp.x < 0 || pp.x > vw || pp.y < 0 || pp.y > vh) {
                    tooBig = true;
                    break;
                }
            }
    
            if (j == 1 && !tooBig) {
                zoomIn = true;
            }
    
            if (zoomIn) {
                if (tooBig) {
                    camera.setWidth(extentsLength / (1 + (j - 2) * 0.04));
                    camera.setHeight(extentsLength / (1 + (j - 2) * 0.04));
                    break;
                }
                else {
                    camera.setWidth(extentsLength / (1 + j * 0.04));
                    camera.setHeight(extentsLength / (1 + j * 0.04));
                }
            }
            else {
                if (!tooBig) {
                    break;
                }
                camera.setWidth(extentsLength / (1 - j * 0.04));
                camera.setHeight(extentsLength / (1 - j * 0.04));
            }
        }
        await viewer.view.setCamera(camera);
    }

    static async fitNodes(viewer, nodeids,config) {

        let bounding = await viewer.model.getNodesBounding(nodeids, config);
        const extents = bounding.extents();
        const extentsLength = extents.length();
        let camera = viewer.view.getCamera();
        const height = camera.getHeight();
        const eye = Communicator.Point3.subtract(camera.getPosition(), camera.getTarget());
        const eyeLength = eye.length();
        const newEyeLength = (extentsLength * eyeLength) / height;
        const target = bounding.center();
        const position = Communicator.Point3.add(target, eye.normalize().scale(newEyeLength));
  
        camera.setTarget(target);
        camera.setPosition(position);
  
        camera.setWidth(extentsLength);
        camera.setHeight(extentsLength);
        let corners = bounding.getCorners();
  
        let vw = $(viewer.getViewElement()).width();
        let vh = $(viewer.getViewElement()).height();
  
        let zoomIn = false;
  
        for (let j = 1; j < 200; j++) {
          let tooBig = false;
          for (let i = 0; i < corners.length; i++) {
            let pp = viewer.view.projectPoint(corners[i], camera);
            if (pp.x < 0 || pp.x > vw || pp.y < 0 || pp.y > vh) {
              tooBig = true;
              break;
            }
          }
  
          if (j == 1 && !tooBig) {
            zoomIn = true;
          }
  
          if (zoomIn) {
            if (tooBig) {
              camera.setWidth(extentsLength / (1 + (j - 2) * 0.02));
              camera.setHeight(extentsLength / (1 + (j - 2) * 0.02));
              break;
            }
            else {
              camera.setWidth(extentsLength / (1 + j * 0.02));
              camera.setHeight(extentsLength / (1 + j * 0.02));
            }
          }
          else {
            if (!tooBig) {
              break;
            }
            camera.setWidth(extentsLength / (1 - j * 0.02));
            camera.setHeight(extentsLength / (1 - j * 0.02));
          }
        }
        await viewer.view.setCamera(camera);
      }
}
