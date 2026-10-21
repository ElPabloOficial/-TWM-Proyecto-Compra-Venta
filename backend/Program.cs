using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using TiendaOnline.API.Models;
using TiendaOnline.API.Auth;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar la Base de Datos
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// 2. Configurar Basic Auth
builder.Services.AddAuthentication("BasicAuthentication")
    .AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandler>("BasicAuthentication", null);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 3. Configurar Swagger
builder.Services.AddSwaggerGen();

// 4. Configurar CORS para React
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("PermitirReact");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();