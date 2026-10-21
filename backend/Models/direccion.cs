using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class direccion
{
    public int id { get; set; }

    public int numero { get; set; }

    public string calle { get; set; } = null!;

    public string? descripcion { get; set; }

    public string? pasaje { get; set; }

    public string? sector { get; set; }

    public int id_comuna { get; set; }

    public virtual ICollection<despacho> despachos { get; set; } = new List<despacho>();

    public virtual comuna id_comunaNavigation { get; set; } = null!;

    public virtual ICollection<empresa> id_empresas { get; set; } = new List<empresa>();

    public virtual ICollection<usuario> id_usuarios { get; set; } = new List<usuario>();
}
