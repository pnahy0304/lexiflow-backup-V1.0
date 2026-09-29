# CLI Reference

Use this as a map, not as a substitute for `chrome-devtools <command> --help`.

Verified against `chrome-devtools-mcp` 1.8.0. The command surface moves between minor releases — when a command below is rejected, run `--help` before assuming the skill is wrong.

## How The CLI Runs

`chrome-devtools` is a client for a background `chrome-devtools-mcp` daemon. On Linux/macOS it uses a Unix socket; on Windows it uses a named pipe.

- First real action auto-starts the daemon and browser if needed.
- Later commands reuse the same browser state.
- `start`, `status`, and `stop` are for setup and troubleshooting.
- `chrome-devtools start` forwards supported launch options such as `--headless`, `--userDataDir`, `--browserUrl`, `--channel`, `--proxyServer`, `--usageStatistics`, and `--slim`.

If an MCP client is already running `chrome-devtools-mcp`, this daemon is a second, independent instance. Both drive Chrome, so prefer one or the other within a single session.

## Page Handles

Almost every command takes a `<pageId>` as its first positional argument. Page ids are indices into the browser's page list — obtain them from `list_pages`, or open a page with `new_page` and list again.

```bash
chrome-devtools list_pages
chrome-devtools new_page "https://example.com"
chrome-devtools select_page 0 --bringToFront
```

`list_pages` and `new_page` are the only interaction commands that take no page id. `evaluate_script` takes it as an optional `--pageId` flag instead of a positional argument.

Examples below use `0` as the page id and `1_3` as an element uid. Both are placeholders — read the real values from `list_pages` and `take_snapshot`.

## Navigation And Page State

```bash
chrome-devtools navigate_page 0 --url "https://example.com"
chrome-devtools navigate_page 0 --type "back"
chrome-devtools navigate_page 0 --type "forward"
chrome-devtools navigate_page 0 --type "reload" --ignoreCache
chrome-devtools resize_page 0 1280 720
chrome-devtools close_page 0
```

`navigate_page` also accepts `--handleBeforeUnload`, `--initScript`, and `--timeout`. The last open page cannot be closed.

## Snapshot-Based Interaction

```bash
chrome-devtools take_snapshot 0
chrome-devtools take_snapshot 0 --verbose --filePath snapshot.txt
chrome-devtools click 0 "1_3"
chrome-devtools click 0 "1_3" --dblClick --includeSnapshot
chrome-devtools click_at 0 120 340
chrome-devtools fill 0 "1_5" "text"
chrome-devtools hover 0 "1_7" --includeSnapshot
chrome-devtools drag 0 "1_8" "1_9"
chrome-devtools press_key 0 "Enter" --includeSnapshot
chrome-devtools type_text 0 "hello" --submitKey "Enter"
chrome-devtools upload_file 0 "1_10" "./file.txt"
chrome-devtools handle_dialog 0 accept --promptText "value"
```

The uid shape varies by snapshot. Re-snapshot after navigation, reloads, or major DOM updates.

There is no wait command. To wait for a condition, poll with `evaluate_script`, or pass `--timeout` to `navigate_page`.

## Runtime Debugging

```bash
chrome-devtools evaluate_script "() => document.title" --pageId 0
chrome-devtools evaluate_script "(node) => node.innerText" --pageId 0 --args 1_4
chrome-devtools evaluate_script "() => performance.now()" --pageId 0 --filePath out.txt
chrome-devtools list_console_messages 0
chrome-devtools list_console_messages 0 --types error --includeStackTraces
chrome-devtools get_console_message 0 1
chrome-devtools list_network_requests 0
chrome-devtools list_network_requests 0 --resourceTypes Fetch --pageSize 50
chrome-devtools get_network_request 0 --reqid 1 --requestFilePath req.md --responseFilePath res.md
chrome-devtools take_screenshot 0 --filePath page.png
chrome-devtools take_screenshot 0 --uid "1_4" --format jpeg --quality 80
chrome-devtools take_screenshot 0 --fullPage --filePath full.png
```

`evaluate_script` also accepts `--dialogAction`, `--waitForStableDom`, and `--serviceWorkerId`.

## Emulation, Audits, And Performance

```bash
chrome-devtools emulate 0 --viewport "390x844"
chrome-devtools emulate 0 --colorScheme "dark"
chrome-devtools emulate 0 --networkConditions "Offline"
chrome-devtools emulate 0 --cpuThrottlingRate 4
chrome-devtools emulate 0 --geolocation "37.77,-122.42"
chrome-devtools emulate 0 --extraHttpHeaders '{"X-Custom":"value"}'
chrome-devtools lighthouse_audit 0 --mode "navigation"
chrome-devtools lighthouse_audit 0 --mode "snapshot" --device "mobile" --outputDirPath ./reports
chrome-devtools performance_start_trace 0 --reload --autoStop
chrome-devtools performance_start_trace 0 --reload --filePath trace.json.gz
chrome-devtools performance_stop_trace 0 --filePath trace.json
chrome-devtools performance_analyze_insight 0 "LCPBreakdown"
chrome-devtools screencast_start 0 --filePath demo.webm
chrome-devtools screencast_stop 0
```

Navigate to the target URL before starting a trace when `--reload` or `--autoStop` is enabled.

## Memory Analysis

Heap snapshots are captured per page, then analyzed by file path. The capture and the analysis are separate command families.

```bash
chrome-devtools take_heapsnapshot 0 ./snap.heapsnapshot
chrome-devtools get_heapsnapshot_summary ./snap.heapsnapshot
chrome-devtools get_heapsnapshot_details ./snap.heapsnapshot
chrome-devtools get_heapsnapshot_dominators ./snap.heapsnapshot
chrome-devtools get_heapsnapshot_duplicate_strings ./snap.heapsnapshot
chrome-devtools query_heapsnapshot_objects ./snap.heapsnapshot
chrome-devtools get_heapsnapshot_retainers ./snap.heapsnapshot
chrome-devtools compare_heapsnapshots ./before.heapsnapshot ./after.heapsnapshot
chrome-devtools close_heapsnapshot ./snap.heapsnapshot
```

Loaded snapshots stay in memory until closed. Run `close_heapsnapshot` when finished.

## Output And Troubleshooting

```bash
chrome-devtools take_snapshot 0 --output-format=json
chrome-devtools status
chrome-devtools start --headless
chrome-devtools start --browserUrl http://127.0.0.1:9222
chrome-devtools stop
```

If actions fail because no daemon or browser is reachable, run `status`, then use `start --help` to choose launch flags. Stop the daemon when switching profiles, channels, or connection targets.

## Behind Feature Flags

Extension, PWA, WebMCP, and third-party developer tool commands (`install_extension`, `install_pwa`, `list_webmcp_tools`, `execute_3p_developer_tool`, and siblings) require the daemon to be started with the matching flag. Run the command's `--help` to see which flag it needs.
