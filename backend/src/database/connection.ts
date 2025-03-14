import sql from "mssql";

const dbSettings = {
    user: "primetech",
    password: "3YYWJPb6ha*1",
    server: "srv-sicp-01.database.windows.net",
    database: "SIPC",
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
