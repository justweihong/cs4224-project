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
│   │   ├── setup
│   │   └── 
│   ├── ysql
│   │   ├── setup
│   │   └── ..
│   ├── README.md

```
* To configure the nodes, run the following commands in order:
```
./.bash_profile
(while logged into xcnd0) startMaster0
(while logged into xcnd1) startMaster1
(while logged into xcnd2) startMaster2

(while logged into xcnd0) startTablet0
(while logged into xcnd1) startTablet1
(while logged into xcnd2) startTablet2
(while logged into xcnd3) startTablet3
(while logged into xcnd4) startTablet4

```
Verify that all master and tablet nodes are operational using the commands:
```
yugaMasters
yugaTablets

```
* To populate the YSQL database, run the following command while in the cs4224-project directory:
```
chmod 777 ./ysql/setup/init.sh
./ysql/setup/init.sh
```
* To populate the YCQL database, while in the cs4224-project directory, download version 0.0.27 of cassandra loader using wget:
```
wget https://github.com/brianmhess/cassandra-loader/releases/download/v0.0.27/cassandra-loader
```
* Next, run the following commands:
```
chmod 777 cassandra-loader
chmod 777 ./ycql/setup/init.sh
./ycql/setup/init.sh
```
* Finally, to execute transactions in YSQL or YCQL, enter the relevant folder (/ysql or /ycql) and run the command:
```
node server
