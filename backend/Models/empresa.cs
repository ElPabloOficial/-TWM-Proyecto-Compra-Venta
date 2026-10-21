using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class empresa
{
    public string rut { get; set; } = null!;

    public string nombre { get; set; } = null!;

    public string? paginaweb { get; set; }

    public string? giro { get; set; }

    public virtual ICollection<correo> correos { get; set; } = new List<correo>();

    public virtual ICollection<telefono> telefonos { get; set; } = new List<telefono>();

    public virtual ICollection<direccion> id_direccions { get; set; } = new List<direccion>();

    public virtual ICollection<usuario> id_usuarios { get; set; } = new List<usuario>();
}
