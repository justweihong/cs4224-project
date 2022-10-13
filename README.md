# CS4224 Project 
Done in AY22/23 Semester 1

### Setup
* Download project data at: http://www.comp.nus.edu.sg/~cs4224/project_files.zip
* Extract at the main directory.
* Install Yugabyte Locally.
* Directory structure should be:
```
├── yugabyte-2.14.1.0 (Yugabyte version required by project)
├── cs4224-project (THIS PROJECT DIR)
│   ├── documents
│   ├── project_files (downloaded data)
│   │   ├── data_files
│   │   └── xact_files
│   ├── ycql
│   │   ├── ..
│   │   └── 
│   ├── ysql
│   │   ├── setup
│   │   └── ..
│   ├── README.md

```
* To populate the YSQL database, run the following command while in the cs4224-project directory:
```
./ysql/setup/init.sh
```
* To populate the YCQL database, run the following command while in the cs4224-project directory:
```
./ycql/setup/init.sh
```

