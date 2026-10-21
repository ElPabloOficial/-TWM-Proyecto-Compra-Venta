using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class comuna
{
    public int id { get; set; }

    public string nombre { get; set; } = null!;

    public int superficie { get; set; }

    public int id_provincia { get; set; }

    public virtual ICollection<direccion> direccions { get; set; } = new List<direccion>();

    public virtual provincium id_provinciaNavigation { get; set; } = null!;
}
