import { NextResponse } from "next/server";

import fs from "fs";
import { google } from "googleapis";
import path from "path";

const SPREADSHEET_ID = "1q5CpoLUiRJJxgxCJA9hzqa10pan2-eT_0mj2ST5pgrI";
const SHEET_GID = "1907577857";
const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "retail-dashboard-data.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "leads-data-509913-1e20108e1d7a.json");

async function getGoogleSheetsClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error("Google service account key file not found");
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchLive = searchParams.get("live") === "true";

    // Read cached summary data
    let summaryData: any = null;
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      summaryData = JSON.parse(fileContent);
    }

    let liveRows: any[] = [];
    let isConnected = false;
    let liveError = null;

    // Test live connection or fetch live rows
    try {
      const sheets = await getGoogleSheetsClient();
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      const targetSheet =
        meta.data.sheets?.find((s) => String(s.properties?.sheetId) === SHEET_GID) || meta.data.sheets?.[0];
      const sheetTitle = targetSheet?.properties?.title || "data.csv";

      isConnected = true;

      if (fetchLive) {
        // Fetch top 100 recent rows
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${sheetTitle}'!A1:H101`,
        });

        const rawRows = res.data.values || [];
        if (rawRows.length > 1) {
          liveRows = rawRows.slice(1).map((r) => {
            const qty = Number.parseInt(r[3] || "0", 10) || 0;
            const price = Number.parseFloat(r[5] || "0") || 0;
            const inv = r[0] || "";
            return {
              invoiceNo: inv,
              stockCode: r[1] || "",
              description: r[2] || "",
              quantity: qty,
              invoiceDate: r[4] || "",
              unitPrice: price,
              total: Math.round(qty * price * 100) / 100,
              customerId: r[6] || "Guest",
              country: r[7] || "Unknown",
              status: inv.startsWith("C") ? "Cancelled" : "Completed",
            };
          });
        }
      }
    } catch (err: any) {
      liveError = err.message || "Failed to reach Google Sheets";
    }

    return NextResponse.json({
      success: true,
      googleSheet: {
        spreadsheetId: SPREADSHEET_ID,
        gid: SHEET_GID,
        connected: isConnected,
        error: liveError,
        liveRowsCount: liveRows.length,
      },
      data: {
        ...summaryData,
        ...(liveRows.length > 0 ? { recentTransactions: liveRows } : {}),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const sheets = await getGoogleSheetsClient();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const targetSheet =
      meta.data.sheets?.find((s) => String(s.properties?.sheetId) === SHEET_GID) || meta.data.sheets?.[0];
    const sheetTitle = targetSheet?.properties?.title || "data.csv";

    // Read top 200 rows from Google Sheet to verify fresh data
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetTitle}'!A1:H201`,
    });

    const rawRows = res.data.values || [];
    const formattedRows = rawRows.slice(1).map((r) => {
      const qty = Number.parseInt(r[3] || "0", 10) || 0;
      const price = Number.parseFloat(r[5] || "0") || 0;
      const inv = r[0] || "";
      return {
        invoiceNo: inv,
        stockCode: r[1] || "",
        description: r[2] || "",
        quantity: qty,
        invoiceDate: r[4] || "",
        unitPrice: price,
        total: Math.round(qty * price * 100) / 100,
        customerId: r[6] || "Guest",
        country: r[7] || "Unknown",
        status: inv.startsWith("C") ? "Cancelled" : "Completed",
      };
    });

    // Update the recent transactions in cache
    if (fs.existsSync(DATA_FILE_PATH)) {
      const existing = JSON.parse(fs.readFileSync(DATA_FILE_PATH, "utf-8"));
      existing.recentTransactions = formattedRows;
      existing.lastUpdated = new Date().toISOString();
      existing.lastSyncedWithGoogleSheet = new Date().toISOString();
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(existing, null, 2), "utf-8");
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized with Google Sheet "${sheetTitle}"`,
      rowsFetched: formattedRows.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync with Google Sheet" },
      { status: 500 },
    );
  }
}
