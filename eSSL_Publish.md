# EsslSyncAgent Deployment & Scheduling Guide

This guide explains how to copy the compiled synchronization agent to another laptop, configure its connection strings, and schedule it to run automatically every 10 minutes in Windows.

---

## Step 1: Copy files to the target laptop
1. Locate the compiled files on the development machine:
   `D:\Personal\nexgen\EsslSyncAgent\bin\Release\net8.0\win-x64\publish\`
2. Zip this entire directory or copy it directly (e.g. via USB drive, network share, or cloud storage).
3. Extract/paste the files to a permanent directory on the target laptop, for example:
   `C:\EsslSyncAgent`

---

## Step 2: Configure Database Connections
1. Open the file `C:\EsslSyncAgent\appsettings.json` on the target laptop.
2. Edit the SQL Server and PostgreSQL connection strings to point to the correct databases reachable from that machine:
   ```json
   {
     "MsSql": {
       "ConnectionString": "Server=YOUR_MSSQL_SERVER;Database=etimetracklite1;User ID=essl;Password=essl;TrustServerCertificate=True;Connection Timeout=30;"
     },
     "PostgreSql": {
       "ConnectionString": "Host=YOUR_POSTGRES_HOST;Port=5432;Database=VELONEX;Username=postgres;Password=SMDigitalX@003;Command Timeout=60;"
     },
     "Sync": {
       "BatchSize": 500,
       "MaxRetries": 3,
       "RetryDelaySeconds": 10
     },
     "Logging": {
       "LogFilePath": "logs/essl-sync-.log"
     }
   }
   ```

---

## Step 3: Choose an Option to Schedule the Agent

Choose **one** of the two options below to configure the agent to run automatically every 10 minutes.

### Option A: Automatic Setup (Using PowerShell script)
1. On the target laptop, right-click the Windows Start menu and select **Terminal (Admin)** or **PowerShell (Admin)**.
2. Change directory to where you pasted the files:
   ```powershell
   cd C:\EsslSyncAgent
   ```
3. Run the registration script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\Register-SyncTask.ps1
   ```
4. The script will output a confirmation message showing that the scheduled task `EsslSyncSyncAgent` has been registered.

---

### Option B: Manual Setup (Using Windows Task Scheduler GUI)
If you prefer not to use the script, follow these steps to register the task manually:

1. Click the Windows **Start Menu**, search for **Task Scheduler**, and open it.
2. In the right-hand panel (*Actions*), click **Create Task...** (This opens the detailed task creator).

#### 1. "General" Tab
* **Name**: Type `EsslSyncSyncAgent`
* **Description**: Type `Syncs eSSL MSSQL database to PostgreSQL every 10 minutes`
* Select **Run whether user is logged on or not** and choose **NT AUTHORITY\SYSTEM** (or another administrator account) under "Change User or Group...".
* Check the box for **Run with highest privileges**. This is critical to ensure the agent has full access to run successfully without UAC/permission issues.

#### 2. "Triggers" Tab (When it runs)
1. Click **New...** at the bottom.
2. Configure settings:
   * **Begin the task**: `On a schedule`
   * Select **One time** under Settings.
   * Under **Advanced settings**:
     * Check **Repeat task every:** and choose or type **10 minutes**.
     * Set **for a duration of:** to **Indefinitely**.
     * Check **Enabled** at the bottom.
3. Click **OK**.

#### 3. "Actions" Tab (What it runs)
1. Click **New...** at the bottom.
2. Configure settings:
   * **Action**: `Start a program`
   * **Program/script**: Click **Browse...** and select `C:\EsslSyncAgent\EsslSyncAgent.exe`.
   * **Start in (optional)**: Paste the directory path **without quotes**:
     `C:\EsslSyncAgent`
     *(CRITICAL: This tells the program where to find `appsettings.json` and where to save the logs folder).*
3. Click **OK**.

#### 4. "Conditions" Tab (Power settings)
* Under *Power*, **uncheck** the box that says **Start the task only if the computer is on AC power**. (This allows the task to run when the laptop is on battery power).

#### 5. "Settings" Tab (Behavior settings)
* Check **Run task as soon as possible after a scheduled start is missed**.
* Check **If the running task does not end when requested, force it to stop**.
* Click **OK** to save the task.

---

## Step 4: Verify that the Sync Agent is Working

1. **Manual Test Run**: Double-click `EsslSyncAgent.exe` in `C:\EsslSyncAgent`. A console window will pop up showing the synchronization of the 28 tables, then close when finished.
2. **Log Verification**: Open the `C:\EsslSyncAgent\logs` folder and check the generated log file (e.g. `essl-sync-20260614.log`) to confirm the databases connected and synced successfully.
3. **Task Scheduler Verification**: Right-click `EsslSyncSyncAgent` in Task Scheduler and click **Run**. Verify that the "Last Run Result" updates to `The operation completed successfully. (0x0)`.
