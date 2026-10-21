using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class ofertum
{
    public int id { get; set; }

    public decimal preciooferta { get; set; }

    public bool? estado { get; set; }

    public virtual ICollection<producto> productos { get; set; } = new List<producto>();

    public virtual ICollection<servicio> servicios { get; set; } = new List<servicio>();
}
