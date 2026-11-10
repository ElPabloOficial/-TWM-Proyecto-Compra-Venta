using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComunasController : ControllerBase
{
    private readonly AppDbContext _context;

    public ComunasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/comunas
    // Lista todas las comunas con su provincia y región, para armar los selectores de dirección.
    [HttpGet]
    public async Task<IActionResult> GetComunas()
    {
        var comunas = await _context.comunas
            .AsNoTracking()
            .OrderBy(c => c.nombre)
            .Select(c => new
            {
                c.id,
                c.nombre,
                provincia = c.id_provinciaNavigation.nombre,
                region = c.id_provinciaNavigation.id_regionNavigation.nombre
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Comunas obtenidas.", data = comunas, errors = (object?)null });
    }
}
