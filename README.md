# Minimal Bounding

## Version Update (1.0.5) 
* Function for aligning camera with minimal bounding box added.
Example:
```
   let res = await MinimalBounding.calculateMinimalBounding(hwv,hwv.selectionManager.getLast().getNodeId(),50000,undefined,undefined,true);
   MinimalBounding.alignCameraWithMinimalBounding(hwv, res, new Communicator.Point3(0,1,0), new Communicator.Point3(1,0,0));
```

## Version Update (1.0.2) 
* Functions for fitting nodes to camera added (beta)  
Examples:  
`MinimalBounding.fitNodesExact(hwv,[hwv.model.getRootNode()]);` (slower but fits model tightly)   
`MinimalBounding.fitNodes(hwv,[hwv.model.getRootNode()],{tightBounding:true, ignoreInvisible:true});`


## Version Update (1.0.1) 
* Function for generating points of convex hull.  
Example: 
```
    let pointarray = MinimalBounding.calculateConvexHullPoints(hwv,hwv.selectionManager.getLast().getNodeId());
```

## Overview
This class calculates the minimal bounding box for a node in HOOPS Communicator. This is the most tightly fitting bounding box around the geometry contained within a node, and will often not be axis aligned. Calculating this bounding box can be useful for volume calculations and measurements and is functionality often found in various CAD applications

The algorithm to calculate the minimum bounding box uses a brute-force approach which first generates the convex hull of the geometry contained within the node and then attempts to fit the bounding box from many different directions. This means that the result is not guaranteed to be the tightest possible bounding but in practice the results should be fairly precise.

As a bonus, the class also calculates a mesh representing the convex hull of the geometry contained within the node. 

For questions/feedback please post in our [forum](https://forum.techsoft3d.com/) or send an email to guido@techsoft3d.com. To learn more about the HOOPS Web Platform and for a 60 day trial go to https://www.techsoft3d.com/products/hoops/web-platform.


## GitHub Project

The public github project can be found here:  
https://github.com/techsoft3d/ts3d-hc-minmalbounding


## Install

* Clone above GitHub project (libraries can be found in the ./dist folder)
* Add library to your application with a script tag or use module version
```
<script src="./js/hcMinimalBounding.min.js"></script>
var MinimalBounding = hcMinimalBounding.MinimalBounding;
```
If you are planning to fork the project and make changes to the core library make sure to run `npm install` in the root folder to install required dependencies.



## Demo

For a live 3D Sandbox demo of the this library please see [here](https://3dsandbox.techsoft3d.com/?snippet=3GAnpHSmkLRLI8pwWNQBL0). There is also a demo available as part of this project you can run directly from the dev/public folder (http://127.0.0.1:5500/dev/public/viewer.html?scs=models/microengine.scs). 



## Usage
**calculateMinimalBounding**
```
static async calculateMinimalBounding(
    viewer,                             //HOOPS Communicator Viewer Object
    nodeid,                             //Nodeid of the node to calculate the bounding box for
    iterations = 10000,                 //Number of iterations to run the fit algorithm for
    origBoundsBias = 0.9,               //Bias towards the initial tight bounding box of the parts
    steps = 1                           //Iteration steps for major axis fitting
);                         

Returns:
Structure Containing the min, max of the bounding box, the node of the bounding box geometry as well as its volume.
```

**Description**
Calculates the miniminal bounding box of a node and display the result.    


**Example**
```
    MinimalBounding.calculateMinimalBounding(hwv,hwv.selectionManager.getLast().getNodeId());
```

**showConvexHull**
```
static async showConvexHull(
    viewer,                             //HOOPS Communicator Viewer Object
    nodeid,                             //Nodeid of the node to calculate the convex hull
);                         

Returns:
nodeid of node containing the convex hull geometry
```

**Description**
Calculates the convex hull of a node using the quickhull3d library and displays the result.   


**Example**
```
    let nodeid = await MinimalBounding.showConvexHull(hwv,hwv.selectionManager.getLast().getNodeId());
    hwv.model.setNodesOpacity([nodeid],0.75);
    hwv.model.setInstanceModifier(Communicator.InstanceModifier.DoNotSelect,[nodeid],true);
```


**showBoundingMesh**
```
static async showBoundingMesh(
    viewer,                             //HOOPS Communicator Viewer Object
    nodeid,                             //Nodeid of the node to calculate the convex hull
);                         

Returns:
nodeid of node containing the bounding meshy
```

**Description**
Calculates the axis aligned tight bounding box of a node and displays the result.  

**Example**
```
    MinimalBounding.showBoundingMesh(hwv,hwv.selectionManager.getLast().getNodeId());
```




## Acknowledgments
### Library:
* [quickhull3d](https://www.npmjs.com/package/quickhull3d)


### Demo:
* [GoldenLayout](https://golden-layout.com/)




## Disclaimer
**This library is not an officially supported part of HOOPS Communicator and provided as-is.**


