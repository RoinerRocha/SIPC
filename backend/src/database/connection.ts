import sql from "mssql";

const dbSettings = {
    user: "rocha",
    password: "Hares7S9Q0L1*",
    server: "srv-sipe.database.windows.net",
    database: "SIPE",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

export const getConnection = async () => {
    try {
        const pool = await sql.connect(dbSettings);
        const result = await pool.request().query("SELECT GETDATE()")
        console.log(result);
        return pool;
    } catch (error) {
        console.log(error);
    }
};
