using Microsoft.EntityFrameworkCore;
using TiendaOnline.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using Microsoft.AspNetCore.Mvc;



var builder = WebApplication.CreateBuilder(args);

// 1. Configurar la Base de Datos
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(
    options => options.UseNpgsql(connectionString)
);

// 2. Configurar JWT
var jwtKey = builder.Configuration["Jwt:Key"];

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme
)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey!)
        ),

        ValidateIssuer = false,
        ValidateAudience = false,

        ValidateLifetime = true,

        ClockSkew = TimeSpan.Zero
    };
});

// 3. Configurar autorización
builder.Services.AddAuthorization();

// 4. Configurar Controllers
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = contexto =>
        {
            var errores = contexto.ModelState
                .Where(e => e.Value != null && e.Value.Errors.Count > 0)
                .SelectMany(e => e.Value!.Errors.Select(x => x.ErrorMessage))
                .ToList();

            return new BadRequestObjectResult(new
            {
                success = false,
                message = "Datos inválidos.",
                data = (object?)null,
                errors = errores
            });
        };
    });
builder.Services.AddEndpointsApiExplorer();

// 5. Configurar Swagger
builder.Services.AddSwaggerGen();

// 6. Configurar CORS para React
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseStaticFiles();

// 7. Configurar Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 8. CORS
app.UseCors("PermitirReact");

// 9. Autenticación JWT
app.UseAuthentication();

// 10. Autorización
app.UseAuthorization();

// 11. Controllers
app.MapControllers();

app.Run();