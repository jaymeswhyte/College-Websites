DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOL DEFAULT NULL
);

INSERT INTO users (username, password, is_admin)
VALUES
    ("Admin", "pbkdf2:sha256:260000$SAAhjccNXAtIoulM$9325c16ba43b2cc28cc2fbdd84ef40a369fcb5631e1d2e30a31d168160d3acf2", True),
    ("user", "pbkdf2:sha256:260000$hcs3xhZH3Z849vQa$c42bf8fdee8ef69707563eaf491f5af0342b91aa36ca46870eda7018e4aacaf9", NULL)
;

DROP TABLE IF EXISTS articles;

CREATE TABLE articles
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE DEFAULT '2022-01-01'
);

INSERT INTO articles (title, content, date)
VALUES
    ("Hitman for Hire Site Causes Spike in Homicides", "A recent nationwide spike in homicide figures is rumoured to be linked to a new deep-web hitman for hire site. At least 3 counts of homicide across the country in the past week have been reported to be linked to the site, which opened earlier this month and has presumably seen a lot of traffic since. For legal reasons, we cannot provide the link to this site, however we can confirm its existence alongside at multiple eyewitness reports referencing alleged ‘contract killers’ targeting normal, everyday people.
One such victim was John Nash, a resident of Cork city who was brutally murdered in cold blood this past Monday. Nash was a simple man, with no political or criminal affiliations or conflict. By most accounts, Nash was an inoffensive and gentle man. The exception to this is Nash’s neighbour Tobey Moore, who in an interview claimed Nash was “… a bit of a d****” who “permanently borrowed my lawnmower” and “got what was coming to him”.
Moore was later arrested as a suspect.
The legitimacy of this hitman for hire site is unknown. Payments are only accepted via the cryptocurrency ‘Bitcoin’, which is commonly used on sites like these to scam would-be hitman clients via anonymous transactions. However, due to the recency of this site’s appearance correlating with this spike in homicides, it’s difficult to definitively put this down as a hoax.
Stay tuned for updates.
", '2022-03-06'),

    ("Local Man Learns to Fly", "Jacob Friar, a balloon vendor local to Dingle, Kerry, was spotted floating multiple metres above the ground last Sunday by passers-by.
Dubbed “Mr. Balloon Hands” by locals, Friar spent over 5 hours suspended in the air by a series of large helium balloons affixed to his arms. During this time, news crews had plenty of time to arrive and set up their equipment. Needless to say, there were questions to be asked. When prompted about his motive, Friar told reporters he spent his time in the air to peacefully protest rising global Helium prices.
“Helium is a non-renewable resource, and slowly but surely, the world is running out. The impending helium crisis has forced us balloon vendors to either raise our prices or work with much tighter profit margins. I speak on behalf of the balloon community when I say I find it necessary for the use of Helium in non-balloon applications to be immediately ceased.”
When questioned about the importance of balloon making in comparison to other uses of Helium – including but not limited to medical applications, transportation, welding, spaceflight, and gas leak detection – Friar responded by telling a reporter to “Get real”. We are unsure of the exact meaning of this remark at this point.
Friar has been spotted floating on twice since, drinking an unknown solution out of plastic cups on both occasions.
", '2022-03-07')
;

DROP TABLE IF EXISTS comments;

CREATE TABLE comments
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    comment TEXT NOT NULL,
    date DATE DEFAULT '2022-01-01'
);

INSERT INTO comments (article_id, username, comment)
VALUES (1, "user", "But did the glove fit?");