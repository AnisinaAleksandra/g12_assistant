/**
 * Grafana Dashboard Tutorial - YouTube Transcript
 * Video: Create your Business Grafana dashboard | Step by step for analysts | Grafana Tutorial
 * URL: https://www.youtube.com/watch?v=HNCKbGfAU0Q
 * Source: tactiq.io free youtube transcript
 */

export const grafanaDashboardTutorial = {
  videoId: "HNCKbGfAU0Q",
  title: "Create your Business Grafana dashboard | Step by step for analysts | Grafana Tutorial",
  url: "https://www.youtube.com/watch?v=HNCKbGfAU0Q",
  chunks: [
    {
      topic: "Dashboard Overview",
      startTime: "00:00:01",
      content: `This is the Grafana dashboard I am going to create in this video. I will start with a brief description of all the dashboard elements and then proceed to the step-by-step instructions.

Obviously, before you can follow along, Grafana needs to be installed, or you need to have a Grafana Cloud account. I have a video about the Grafana installation. Please, watch it first if you are still wondering where to begin.

In this video, I assume you know how to login into Grafana and cannot wait to start experimenting.`,
      keywords: ["dashboard", "overview", "installation", "grafana cloud", "login"],
    },
    {
      topic: "Dashboard Elements Description",
      startTime: "00:00:40",
      content: `My dashboard is created for a company whose business spins across the globe with sales in the United States. On the top, I have time zones and a company logo. They are followed by sales per month in a bar chart and three kinds of sales plans. I use color-coding to indicate how close the actual sales are to the company's goals.

Next, I have single stat elements where color also has an indicative function. On the bottom of my dashboard, I placed a couple of rows. A Grafana row is a group of panels that could be shown or hidden using this little arrow. That row contains 2 PDF documents. And the other row displays two detailed visualizations.

The first one utilizes a geomap showing sales by region where I can zoom in and zoom out. On this one, on the bottom, you can see sales per month per product. I can filter by product with multiple selections by clicking on a product name and holding the Shift button.

The last elements on my dashboard are filters by product name and by product category.`,
      keywords: ["dashboard elements", "time zones", "bar chart", "sales plans", "color coding", "single stat", "rows", "panels", "geomap", "filters", "product", "category"],
    },
    {
      topic: "Data Source Configuration",
      startTime: "00:02:16",
      content: `Right after you install Grafana and before you can create your first dashboard, you need to add a data source. A data source is a translator between your data storage and Grafana visualizations. There is no other way; there must always be a data source.

To add one, go to the configuration and then hit the add data source button. Look at all these options; there are time-series databases, logging, and document databases, tracing, SQL, and more. If you do not see the data source for your data storage, well, with pleasure, Volkov Labs can build it for you.

For this demonstration, my data is stored in the PostgreSQL database; therefore, it is my choice. After selecting the data source, I need to fill out its configuration. For the PostgreSQL, here is what the form looks like. The name could be anything. I keep the default value. Since I use PostgreSQL in a docker container, my host is host.docker.internal, and I keep the default port 5432. Next, my database is postgres, user is postgres, and the password is mysecretpassword. I disable the TLS/SSL Mode and now can save and test my connection. This successful message tells me that I am all set with the data source!`,
      keywords: ["data source", "configuration", "postgresql", "docker", "host", "port", "database", "user", "password", "tls", "ssl", "connection", "test"],
    },
    {
      topic: "Creating Dashboard and Adding Panels",
      startTime: "00:03:45",
      content: `To start my dashboard, I hover over this cross and select dashboard. Next, I save my dashboard by using this save icon and typing a good descriptive name. In my case, it is Sales Analytics. I click save. Here is it, a brand new, empty dashboard. I want to add a star so that later on, I can make it my default dashboard.

Now I need to add a panel. Every visualization belongs to a panel. Click this icon and select the Add a new panel option. Now I am "inside" the panel; almost all panel configurations are here for me to adjust. Here is a drop-down with all installed visualizations. I select a bar chart.`,
      keywords: ["dashboard", "create", "save", "panel", "visualization", "bar chart", "add panel"],
    },
    {
      topic: "SQL Queries and Data Format",
      startTime: "00:04:35",
      content: `After that, I switch the data view to a table view. In a table view, all fetched data is displayed in a columnar format, and this is what I always double-check before working with any graphical visualizations.

Grafana was initially created to visualize and monitor servers and network activities. That made time series its default data format. However, the table format is well-supported as well. That brings me to my next stop, where I change from Time Series format to a Table format.

This area is designed to specify your query. It can be done via query builder, but I am native to SQL, so I prefer to switch to the raw SQL format view. How exactly you write and test your SQL is totally up to you. I use the pgAdmin4 tool, which could easily be installed in a docker container. I explain docker containers in my other video. Check it out if it is still confusing.

All right, back to the SQL query creation. This is my SQL to fetch sales per month. I run it, confirm everything is excepted, then copy it into the Grafana query area. After that, I check the table view. Everything looks good. Now I can switch to the graphical view and work on the visual representation. Note that when I am hovering over the bars, Grafana displays the data point details. The captions come from the SQL aliases.`,
      keywords: ["table view", "time series", "sql", "query", "query builder", "raw sql", "pgadmin", "docker", "data format", "visualization", "aliases"],
    },
    {
      topic: "Panel Styling and Configuration",
      startTime: "00:06:14",
      content: `All right, the query is in place, and the visual is working. Next, I want to adjust my style a little bit. Here I work with the title, bar width, line width, set units to US dollars, and color to a fixed blue. Looking good enough to save and apply. Here you go. The first visualization with sales per month is ready.`,
      keywords: ["styling", "title", "bar width", "line width", "units", "color", "configuration"],
    },
    {
      topic: "Bar Gauge Visualization",
      startTime: "00:06:42",
      content: `Now let's add a bar gauge. For that, click on Add panel icon, then use Add a panel button. Select a bar gauge from the drop-down menu. Make sure the data source is correct, meaning the one you added for this visualization. The format is Table, and switch to raw SQL.

By my design, I need two queries for every bar gauge. One is for as of today's sales, and that query goes into the query A section. Then I click plus query button and enter my second query, for the plan value, into the query B section. Next, I need to specify how queries A and B are related. That could be done by using Grafana Transformations. For that, I can go to the 'Transform' tab. Scroll down and select 'Config from query results' option. That transformation adjusts the results of one query based on the other query.

My config query is B, I want to apply it to all numeric fields and use it as Max. Those settings make the results of query B to be used by the bar gauge to set the max length of its bar. That's all for query prep. Let's work on visual appearance. On the right side, I am going to change the title. I like a Horizontal orientation and RetroLCD style. I work with sales in Us Dollars. And I want explicitly specify the minimum as 0. Otherwise, by default, it takes the value from the existing query. The last configuration I would like to change would be colors. I want them to start from red with a gradient into green. Click save and apply. Adjust the size and location. I am going to repeat the same steps for two other bar gauges. But to make the process a little faster, I will use the duplicate function.`,
      keywords: ["bar gauge", "visualization", "queries", "transformations", "config from query results", "orientation", "style", "colors", "gradient", "duplicate"],
    },
    {
      topic: "Single Stat Visualizations",
      startTime: "00:08:57",
      content: `The following three visualizations are a single value stat with different flavors. The first one, units sold, is pretty straightforward. I add a new panel, then select a Stat visualization from a drop-down, specify the query, and change the panel title and style.

For the next one, I would like to add a color coding and use red if the metric requires immediate attention. For color coding configuration, I need to add a second query which I use in a transformation like this, and then I will add a threshold on the right side. Here you go. Now the background color depends on the % of the returned units.

For the third single stat, I use SQL that fetches the series of data, not a single value. Here I have sales per day. The line in the background would indicate the trend.`,
      keywords: ["single stat", "stat visualization", "color coding", "threshold", "trend", "series", "units sold", "sales per day"],
    },
    {
      topic: "PDF Documents in Dashboard",
      startTime: "00:10:00",
      content: `Sometimes, you want to add a document to your dashboard. Maybe a file with some instructions or a list of specific to your business abbreviations. That could be done by employing the Base64/PDF plugin. It is not part of the core Grafana. It needs to be installed from the Marketplace. Grafana Marketplace is in the Configuration -> Plugin Menu. Search for Base64 and click Install. After that, I can select the Base64/PDF plugin from the visualizations drop-down list.

In the database, I already have the data prepared. Meaning I already converted my PDF files into Base64 format and inserted them into the database table. What is left is to write a straightforward query and adjust the panel on the dashboard. Repeat if needed for more documents.

PDF documents are informative but could take up too much space and are not needed all the time. That's why I want to hide them in a row. For that, I click add a panel, then add a new row button. Specify the header and place this raw anywhere I like. I can add panels by dragging and dropping them into this raw.`,
      keywords: ["pdf", "documents", "base64", "plugin", "marketplace", "installation", "row", "hide", "show"],
    },
    {
      topic: "Geo Map Visualization",
      startTime: "00:11:22",
      content: `Geo Map visualization looks stunning and is incredibly easy to work with. As you already guessed, it requires two main parameters: latitude and longitude. I have that prepared in my database and is ready to specify them in my query. Next, I adjust the initial view to start from North America. I make the size of data points dependable on Sales in that location, maybe a couple of other things, and that's it.`,
      keywords: ["geomap", "visualization", "latitude", "longitude", "data points", "sales", "region"],
    },
    {
      topic: "Clock Panels",
      startTime: "00:11:56",
      content: `Moving on to the clock panels. I need to select Clock from the visualization drop-down. The configuration is straightforward. I specify a time zone and a time format for display. Hit the apply and save. Resize and rearrange the dashboard if needed. I repeat this exercise two more times for two other time zones. And here is the look of my dashboard so far. Neat!`,
      keywords: ["clock", "panel", "time zone", "time format", "configuration"],
    },
    {
      topic: "Company Logo",
      startTime: "00:12:24",
      content: `In order to display a logo, I will use the plugin that I installed earlier for PDF documents. Select Base64/PDF, and specify the query, title, and size. Resize the panel on the dashboard. It is looking better with every new panel, right?`,
      keywords: ["logo", "base64", "pdf", "plugin", "image"],
    },
    {
      topic: "Dashboard Variables and Filters",
      startTime: "00:12:45",
      content: `The last elements to cover are the across the dashboard filters. They are located on the top of my dashboard. The Grafana filters are created as variables. Those variables are predefined in the dashboard settings and can be referenced in any panel.

To add a variable, I click on this icon and then select variables. Click new. Here, the name is what I will use for reference in the queries. The label is what is displayed on the dashboard. One of my variables contains a list of all product names. And here is where I set up the query for that. Yes, I need to have the All option and be able to multi-select. Repeat for the second variable. That one contains a list of all product categories. Here you go. Now I have two drop-downs on my dashboard.

Let me show you how to use variables. Here in the query section, I reference them with a dollar sign. After I am done, the panel refreshes accordingly when I change the filter.`,
      keywords: ["variables", "filters", "dashboard settings", "reference", "multi-select", "product names", "product categories", "dollar sign", "query"],
    },
    {
      topic: "UI Theme Configuration",
      startTime: "00:13:55",
      content: `This was my quick guide to your first Grafana dashboard. If you have any questions or suggestions, do not hesitate to reach out. And before I wrap it up, I know when you first launch Grafana, it looks like this. It looks dark. If you like me and want to change that, on the bottom left side, find an icon that is designated for your avatar, hover over it, and select the Preferences menu. Then switch IU Theme to light and click Save. Much better!`,
      keywords: ["theme", "ui", "preferences", "dark", "light", "avatar", "settings"],
    },
  ],
}

/**
 * Добавить этот документ в RAG систему
 */
export function addGrafanaDashboardTutorialToRAG() {
  return grafanaDashboardTutorial.chunks.map((chunk) => ({
    topic: chunk.topic,
    content: chunk.content,
    keywords: chunk.keywords,
    source: `YouTube: ${grafanaDashboardTutorial.title}`,
    videoUrl: grafanaDashboardTutorial.url,
    startTime: chunk.startTime,
  }))
}


