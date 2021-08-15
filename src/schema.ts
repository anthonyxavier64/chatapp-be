const schema = `
    CREATE TABLE IF NOT EXISTS users (
        email varchar(50) primary key,
        password varchar(150) not null,
        firstName varchar(100),
        lastName varchar(100)
    );

    CREATE TABLE IF NOT EXISTS refreshtokens (
        refreshtoken varchar(256) primary key
    )
`;

export = schema;